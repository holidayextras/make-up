'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var EslintIntegration = require('../../../lib/integrations/eslint');
var minimatch = require('minimatch');
var eslint = require('eslint');

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

  describe('_checkFiles()', function() {

    it('is a function', function() {
      EslintIntegration._checkFiles.should.be.a('function');
    });

    context('with no files given', function() {

      var testCallback = sinon.spy();

      before(function() {
        EslintIntegration._checkFiles([], testCallback);
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
        EslintIntegration._checkFiles(['imaginary.js'], testCallback);
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
      EslintIntegration._directoryToGlob('unknownDir').should.have.string('/**/*.?(js|jsx)');
    });

  });

  describe('_processGlobs', function() {

    context('with an error', function() {

      var testCallback = sinon.spy();

      before(function() {
        EslintIntegration._processGlobs({}, testCallback, 'test error');
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
        _checkFiles = sinon.stub(EslintIntegration, '_checkFiles');
        EslintIntegration._processGlobs({}, callback, undefined, files);
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
        stub = sinon.stub(EslintIntegration, '_checkFiles');
        files = ['imaginary.js'];
        EslintIntegration._processGlobs({}, function() {}, undefined, files);
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
