'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
var should = chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var path = require('path');
var streams = require('memory-streams');
var makeup = require('../index');

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

  describe('_getIntegrationModule()', function() {

    it('returns null for a nonexistent integration', function() {
      should.not.exist(makeup._getIntegrationModule('bob'));
    });

    it('returns a module for an existent integration', function() {
      makeup._getIntegrationModule('eslint').should.be.a('object');
    });

  });

  describe('_getEnabledIntegrations()', function() {

    beforeEach(function() {
      sinon.stub(makeup, '_getIntegrationModule');
    });

    afterEach(function() {
      makeup._getIntegrationModule.restore();
    });

    it('calls `_getIntegrationModule` for each enabled integration name', function() {
      makeup._getEnabledIntegrations([1, 2]);
      makeup._getIntegrationModule.should.have.been.calledTwice()
        .calledWith(1).and.calledWith(2);
    });

    it('filters out non existent integration modules', function() {
      makeup._getIntegrationModule
        .onFirstCall().returns(1)
        .onSecondCall().returns(null)
        .onThirdCall().returns(3);
      makeup._getEnabledIntegrations(['a', 'b', 'c']).should.deep.equal([1, 3]);
    });

  });

  describe('check()', function() {

    context('calls back with an error', function() {

      beforeEach(function() {
        sinon.stub(makeup, '_getEnabledIntegrations');
        sinon.stub(makeup, '_runIntegration');
      });

      afterEach(function() {
        makeup._getEnabledIntegrations.restore();
        makeup._runIntegration.restore();
      });

      it('when integrations options does not exist', function(done) {
        makeup.check({}, function(error) {
          error.should.have.deep.property('message', 'no integrations enabled');
          done();
        });
      });

      it('when integrations options is falsy', function(done) {
        makeup.check({ integrations: null }, function(error) {
          error.should.have.deep.property('message', 'no integrations enabled');
          done();
        });
      });

      it('when no valid integrations are specified', function(done) {
        makeup._getEnabledIntegrations.returns([]);
        makeup.check({ integrations: 'integrations' }, function(error) {
          error.should.have.deep.property('message', 'no valid integrations can be enabled from: integrations');
          done();
        });
      });

    });

    context('with enabled integrations', function() {
      var options;
      var integrationStub;
      var testCallback;

      before(function() {
        sinon.stub(makeup, '_getEnabledIntegrations').returns([1, 2]);
        options = { integrations: 'integrations' };
        testCallback = sinon.stub();

        var testStream = new streams.WritableStream();
        testStream.write('TEST');

        integrationStub = sinon.stub(makeup, '_runIntegration');
        integrationStub.yields(null, testStream);

        makeup.check(options, testCallback);
      });

      after(function() {
        makeup._getEnabledIntegrations.restore();
        integrationStub.restore();
      });

      it('runs the given integrations', function() {
        integrationStub.should.have.been.calledTwice();
      });

      it('runs the provided callback', function() {
        testCallback.should.have.been.called();
      });

      it('joins any integration output', function() {
        testCallback.args[0][1].should.equal('TESTTEST');
      });
    });
  });

  describe('_runIntegration()', function() {

    var item;
    var testCallback;

    before(function() {
      item = {
        run: sinon.stub()
      };
      testCallback = sinon.stub();
      makeup._runIntegration({}, item, testCallback);
    });

    it('runs the given integration', function() {
      item.run.should.have.been.called();
    });
  });

});
