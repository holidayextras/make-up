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

describe('MakeUp', function() {

  it('should return an object', function() {
    makeup.should.be.an('object');
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

      it('gives the callback an error', function() {
        testCallback.should.have.been.calledWith(new Error('No files found'));
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
      makeup._directoryToGlob('unknownDir').should.have.string('/**/*.js*');
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

  describe('_fileIsNewer()', function() {

    var stub;
    var since;

    before(function() {
      stub = sinon.stub(fs, 'statSync');
      stub.returns({
        mtime: 'Mon, 10 Oct 2011 23:24:11 GMT'
      });
    });

    after(function() {
      stub.restore();
    });

    context('when the file is newer', function() {

      before(function() {
        since = new Date('Sun, 09 Oct 2011 23:24:11 GMT').getTime();
      });

      it('returns true', function() {
        makeup._fileIsNewer(since, 'imaginary.js').should.be.true();
      });

    });

    context('when the file is older', function() {

      before(function() {
        since = new Date('Tue, 11 Oct 2011 23:24:11 GMT').getTime();
      });

      it('returns false', function() {
        makeup._fileIsNewer(since, 'imaginary.js').should.be.false();
      });

    });

  });

});
