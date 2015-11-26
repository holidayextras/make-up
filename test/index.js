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

    var options;
    var integrationStub;

    before(function() {
      options = {};
      var testCallback = sinon.stub();
      integrationStub = sinon.stub(makeup, '_runIntegration');
      makeup.checkIntegrations = [{
        run: sinon.stub()
      },
      {
        run: sinon.stub()
      }];
      makeup.check(options, testCallback);
    });

    after(function() {
      integrationStub.restore();
    });

    it('runs the given integrations', function() {
      integrationStub.should.have.been.calledTwice();
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
