'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var fs = require('fs');

var RulesetCombiner = require('../../lib/rulesetCombiner');

describe('RulesetCombiner', function() {

  it('should return an object', function() {
    RulesetCombiner.should.be.an('object');
  });

  describe('combineFiles()', function() {

    it('is a function', function() {
      RulesetCombiner.combineFiles.should.be.a('function');
    });

    context('with no extra config', function() {

      var testCallback = sinon.spy();

      before(function() {
        RulesetCombiner.combineFiles('original', undefined, testCallback);
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('does not give the callback an error', function() {
        testCallback.firstCall.args.should.have.length(0);
      });

    });

    context('with an extra config', function() {

      var testCallback = sinon.spy();
      var readStub;
      var writeStub;
      var keyStub;

      before(function() {
        readStub = sinon.stub(fs, 'readFile');
        var fileData = {
          key1: 1,
          key2: 2
        };
        readStub.onFirstCall().yields(undefined, JSON.stringify(fileData));
        readStub.onSecondCall().yields(undefined, JSON.stringify(fileData));

        writeStub = sinon.stub(fs, 'writeFile');
        writeStub.onFirstCall().yields();

        keyStub = sinon.stub(RulesetCombiner, '_mergeKey');

        RulesetCombiner.combineFiles('originalPath', 'extraPath', testCallback);
      });

      after(function() {
        readStub.restore();
        writeStub.restore();
        keyStub.restore();
      });

      it('processes the two keys of the original config', function() {
        keyStub.should.have.been.calledTwice();
      });

      it('runs the callback', function() {
        testCallback.should.have.been.called();
      });

      it('does not give the callback an error', function() {
        testCallback.firstCall.args.should.have.length(0);
      });

    });

  });

  describe('_mergeKey()', function() {

    var original;

    before(function() {
      original = {
        test: {
          foo: 1
        }
      };
      var extra = {
        test: {
          foo: 2,
          bar: 3
        }
      };
      RulesetCombiner._mergeKey(original, extra, 'test');
    });

    it('does not replace existing keys', function() {
      original.test.foo.should.eq(1);
    });

    it('adds new keys', function() {
      original.test.bar.should.eq(3);
    });

  });

});
