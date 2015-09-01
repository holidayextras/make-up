'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var path = require('path');
var makeup = require('../index');
var eslint = require('eslint');
var fs = require('fs');
var minimatch = require('minimatch');

describe('makeup', function() {

  it('should return an object', function() {
    makeup.should.be.an('object');
  });

  describe('GLOBEXTENSION', function() {

    it('matches js files', function() {
      minimatch('file.js', makeup.GLOBEXTENSION).should.be.true();
    });

    it('matches jsx files', function() {
      minimatch('file.jsx', makeup.GLOBEXTENSION).should.be.true();
    });

    it('does not match JSON files', function() {
      minimatch('file.json', makeup.GLOBEXTENSION).should.be.false();
    });

  });

  describe('path()', function() {

    it('is a function', function() {
      makeup.path.should.be.a('function');
    });

    it('returns a path to the requested configuration file', function() {
      var expectedPath = path.resolve(__dirname, '../') + '/configs/configReader';
      makeup.path('configReader').should.equal(expectedPath);
    });

  });

  describe('check()', function() {

    it('is a function', function() {
      makeup.check.should.be.a('function');
    });

    context('without an array of directories given', function() {

      var testCallback = sinon.spy();

      beforeEach(function() {
        makeup.check({}, testCallback);
      });

      it('returns an error', function() {
        testCallback.should.have.been.calledWith(Error('Directory list must be an array'));
      });

    });

    describe('Rule download', function() {

      var downloadStub;
      var existsStub;

      beforeEach(function() {
        downloadStub = sinon.stub(makeup, '_downloadConfig');
        existsStub = sinon.stub(fs, 'existsSync');
      });

      afterEach(function() {
        downloadStub.restore();
        existsStub.restore();
      });

      context('without any existing rules', function() {

        beforeEach(function() {
          existsStub.returns(false);
          makeup.check( { dirs: [] }, function() {});
        });

        it('downloads new rules', function() {
          downloadStub.should.have.been.called();
        });

      });

      context('with existing rules', function() {

        beforeEach(function() {
          existsStub.returns(true);
          makeup.check( { dirs: [] }, function() {});
        });

        it('does not download any rules', function() {
          downloadStub.should.not.have.been.called();
        });

      });

    });

  });

  describe('_checkFiles()', function() {

    it('is a function', function() {
      makeup._checkFiles.should.be.a('function');
    });

    context('with no files given', function() {

      var testCallback = sinon.spy();

      before(function() {
        makeup._checkFiles([], testCallback);
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('calls back with no errors', function() {
        testCallback.should.have.been.calledWith(undefined, { errors: 0, formatted: '', warnings: 0 });
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
              return function() {};
            }
          };
        };
        makeup._checkFiles(['imaginary.js'], testCallback);
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('does not give the callback an error', function() {
        (typeof testCallback.args[0][0]).should.equal('undefined');
      });

      it('gives the callback a results object', function() {
        Object.keys(testCallback.args[0][1]).should.deep.equal(['errors', 'warnings', 'formatted']);
      });

    });
  });

  describe('_directoryToGlob()', function() {

    it('returns a glob with file extension', function() {
      makeup._directoryToGlob('unknownDir').should.have.string('/**/*.?(js|jsx)');
    });

  });

  describe('_processGlobs', function() {

    context('with an error', function() {

      var testCallback = sinon.spy();

      before(function() {
        makeup._processGlobs({}, testCallback, 'test error');
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('gives the error to the callback', function() {
        testCallback.args[0][0].should.equal('test error');
      });

    });

    context('with no files', function() {

      var files;
      var callback;
      var _checkFiles;

      before(function() {
        files = [];
        callback = sinon.spy();
        _checkFiles = sinon.stub(makeup, '_checkFiles');
        makeup._processGlobs({}, callback, undefined, files);
      });

      after(function() {
        _checkFiles.restore();
      });

      it('calls back with an error', function() {
        callback.should.have.been.calledWith(sinon.match.instanceOf(Error));
      });

      it('does not check the files', function() {
        _checkFiles.should.not.have.been.called();
      });

    });

    context('with some files', function() {

      var stub;
      var files;

      before(function() {
        stub = sinon.stub(makeup, '_checkFiles');
        files = ['imaginary.js'];
        makeup._processGlobs({}, function() {}, undefined, files);
      });

      after(function() {
        stub.restore();
      });

      context('with _checkFiles', function() {

        it('executes the function', function() {
          stub.should.have.been.called();
        });

        it('passes the list of files', function() {
          stub.args[0][0].should.deep.equal(files);
        });

        it('passes the callback', function() {
          stub.args[0][1].should.be.a('function');
        });

      });

    });

  });

});
