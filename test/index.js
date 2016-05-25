'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
var should = chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var fs = require('fs');
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

  describe('_getEnabledIntegrationNames()', function() {

    beforeEach(function() {
      sinon.stub(fs, 'readdirSync');
    });

    afterEach(function() {
      fs.readdirSync.restore();
    });

    it('gets all integration module names in the module if no integration names are specified', function() {
      fs.readdirSync.returns('all integrations');
      makeup._getEnabledIntegrationNames().should.equal('all integrations');
      fs.readdirSync.should.have.been.called();
    });

    it('splits the comma separate list of integrations if given as argument', function() {
      makeup._getEnabledIntegrationNames('1,2,3').should.deep.equal(['1', '2', '3']);
      fs.readdirSync.should.not.have.been.called();
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
      var testCallback;

      before(function() {
        options = { integrations: 'integrations' };
        this.sandbox = sinon.sandbox.create();
        this.sandbox.stub(makeup, '_getEnabledIntegrationNames').returns('integrationNames');
        this.sandbox.stub(makeup, '_getEnabledIntegrations').returns([1, 2]);
        testCallback = sinon.stub();

        var testStream = new streams.WritableStream();
        testStream.write('TEST');

        this.sandbox.stub(makeup, '_runIntegration').yields(null, testStream);

        makeup.check(options, testCallback);
      });

      after(function() {
        this.sandbox.restore();
      });

      it('retrieves the enabled integrations', function() {
        makeup._getEnabledIntegrations.should.have.been.calledWith('integrationNames');
      });

      it('runs the given integrations', function() {
        makeup._runIntegration.should.have.been.calledTwice();
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
