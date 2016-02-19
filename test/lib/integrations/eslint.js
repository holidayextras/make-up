'use strict';

var fs = require('fs');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var EslintIntegration = require('../../../lib/integrations/eslint');
var SinceFilter = require('../../../lib/SinceFilter');
var GitSinceFilter = require('../../../lib/GitSinceFilter');
var minimatch = require('minimatch');
var eslint = require('eslint');
var streams = require('memory-streams');

describe('EslintIntegration', function() {

  describe('GLOBEXTENSION', function() {

    it('matches js files', function() {
      minimatch('file.js', EslintIntegration.GLOBEXTENSION).should.be.true();
    });

    it('matches jsx files', function() {
      minimatch('file.jsx', EslintIntegration.GLOBEXTENSION).should.be.true();
    });

    it('does not match JSON files', function() {
      minimatch('file.json', EslintIntegration.GLOBEXTENSION).should.be.false();
    });

  });

  describe('run()', function() {

    var testStream;

    beforeEach(function() {
      testStream = new streams.WritableStream();
      testStream.write('TEST');
    });

    context('without an array of directories given', function() {

      var testCallback = sinon.spy();

      beforeEach(function() {
        EslintIntegration.run({}, testStream, testCallback);
      });

      it('returns an error', function() {
        testCallback.should.have.been.calledWith(Error('Directory list must be an array'));
      });

      it('returns the stream', function() {
        testCallback.args[0][1].toString().should.equal('TEST');
      });

    });

    describe('Rule download', function() {

      var downloadStub;
      var existsStub;

      beforeEach(function() {
        downloadStub = sinon.stub(EslintIntegration, '_downloadConfig');
        existsStub = sinon.stub(fs, 'existsSync');
        existsStub.returns(false);
      });

      afterEach(function() {
        downloadStub.restore();
        existsStub.restore();
      });

      context('without any existing rules', function() {

        beforeEach(function() {
          EslintIntegration.run( { dirs: [] }, process.stdout, function() {});
        });

        it('downloads new rules', function() {
          downloadStub.should.have.been.called();
        });

      });

      context('with existing rules', function() {

        beforeEach(function() {
          existsStub.withArgs(EslintIntegration.ESLINTRC).returns(true);
          EslintIntegration.run( { dirs: [] }, process.stdout, function() {});
        });

        it('does not download any rules', function() {
          downloadStub.should.not.have.been.called();
        });

      });

    });

  });

  describe('_checkFiles()', function() {

    it('is a function', function() {
      EslintIntegration._checkFiles.should.be.a('function');
    });

    context('with no files given', function() {

      var testCallback = sinon.spy();

      before(function() {
        EslintIntegration._checkFiles([], process.stdout, testCallback);
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('does not give the callback an error', function() {
        (typeof testCallback.args[0][0]).should.equal('undefined');
      });

    });

    context('with files given', function() {

      var testCallback = sinon.spy();

      before(function() {
        eslint.CLIEngine = function() {
          return {
            executeOnFiles: function() {
              return {};
            },
            getFormatter: function() {
              return function() {
                return 'something';
              };
            }
          };
        };
        EslintIntegration._checkFiles(['imaginary.js'], process.stdout, testCallback);
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('does not give the callback an error', function() {
        (typeof testCallback.args[0][0]).should.equal('undefined');
      });

    });

    context('with a linting problem', function() {

      var testCallback = sinon.spy();

      before(function() {
        eslint.CLIEngine = function() {
          return {
            executeOnFiles: function() {
              return {
                errorCount: 300
              };
            },
            getFormatter: function() {
              return function() {
                return 'something else';
              };
            }
          };
        };
        EslintIntegration._checkFiles(['imaginary.js'], process.stdout, testCallback);
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('gives the error to the callback', function() {
        testCallback.args[0][0].message.should.equal('Failed linting');
      });

    });

  });

  describe('_directoryToGlob()', function() {

    it('returns a glob with file extension', function() {
      EslintIntegration._directoryToGlob('unknownDir').should.have.string('/**/*.?(js|jsx)');
    });

  });

  describe('_processGlobs', function() {

    context('with an error', function() {

      var testCallback = sinon.spy();

      before(function() {
        EslintIntegration._processGlobs({}, process.stdout, testCallback, 'test error');
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('gives the error to the callback', function() {
        testCallback.args[0][0].should.equal('test error');
      });

    });

    context('with no files', function() {

      var callback;

      before(function() {
        callback = sinon.spy();
        this.sandbox = sinon.sandbox.create();
        this.sandbox.stub(EslintIntegration, '_checkFiles');
        this.sandbox.stub(SinceFilter, 'process');
        this.sandbox.stub(GitSinceFilter, 'process');
        EslintIntegration._processGlobs({}, process.stdout, callback, undefined, []);
      });

      after(function() {
        this.sandbox.restore();
      });

      it('calls back with an error', function() {
        callback.should.have.been.calledWith(sinon.match.instanceOf(Error));
      });

      it('does not filter the files', function() {
        SinceFilter.process.should.not.have.been.called();
        GitSinceFilter.process.should.not.have.been.called();
      });

      it('does not check the files', function() {
        EslintIntegration._checkFiles.should.not.have.been.called();
      });

    });

    context('with some files', function() {

      beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.stub(EslintIntegration, '_checkFiles').yields();
        this.sandbox.stub(SinceFilter, 'process').yields(null, 'sinceFilteredFiles');
        this.sandbox.stub(GitSinceFilter, 'process').yields(null, 'gitSinceFilteredFiles');
      });

      afterEach(function() {
        this.sandbox.restore();
      });

      context('with _checkFiles', function() {

        it('calls the function with the expected parameters', function(done) {
          EslintIntegration._processGlobs({}, 'output', function() {
            EslintIntegration._checkFiles.should.have.been.calledWith('files', 'output');
            done();
          }, undefined, 'files');
        });

        it('calls since filter if enabled by option', function(done) {
          EslintIntegration._processGlobs({ since: 'since' }, 'output', function() {
            SinceFilter.process.should.have.been.calledWith('since', 'files');
            GitSinceFilter.process.should.not.have.been.called();
            EslintIntegration._checkFiles.should.have.been.calledWith('sinceFilteredFiles', 'output');
            done();
          }, undefined, 'files');
        });

        it('calls git since filter if enabled by option', function(done) {
          EslintIntegration._processGlobs({ gitSince: 'gitSince' }, 'output', function() {
            SinceFilter.process.should.not.have.been.called();
            GitSinceFilter.process.should.have.been.calledWith('gitSince', 'files');
            EslintIntegration._checkFiles.should.have.been.calledWith('gitSinceFilteredFiles', 'output');
            done();
          }, undefined, 'files');
        });

      });

    });

  });

});
