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
var fs = require('fs');

describe('makeup', function() {

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
        existsStub.returns(false);
      });

      afterEach(function() {
        downloadStub.restore();
        existsStub.restore();
      });

      context('without any existing rules', function() {

        beforeEach(function() {
          makeup.check( { dirs: [] }, function() {});
        });

        it('downloads new rules', function() {
          downloadStub.should.have.been.called();
        });

      });

      context('with existing rules', function() {

        beforeEach(function() {
          existsStub.withArgs(makeup.ESLINTRC).returns(true);
          makeup.check( { dirs: [] }, function() {});
        });

        it('does not download any rules', function() {
          downloadStub.should.not.have.been.called();
        });

      });

    });

  });

});
