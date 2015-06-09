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
var makeup = require('../index.js');
var eslint = require('eslint');

describe('makeup', function() {

  it('should return an object', function() {
    makeup.should.be.an('object');
  });

  describe('path()', function(){

    it('is a function', function() {
      makeup.path.should.be.a('function');
    });

    it('returns a path to the requested configuration file', function() {
      var expectedPath = path.resolve(__dirname, '../') + '/configs/configReader';
      makeup.path('configReader').should.equal(expectedPath);
    });

  });

  describe('check()', function(){

    it('is a function', function() {
      makeup.check.should.be.a('function');
    });

  });

  describe('_checkFiles()', function(){

    it('is a function', function() {
      makeup._checkFiles.should.be.a('function');
    });

    context('with no files given', function(){

      var testCallback = sinon.spy();

      before(function(){
        makeup._checkFiles([], testCallback);
      });

      it('runs the callback', function(){
        testCallback.should.have.been.called();
      });

      it('gives the callback an error', function(){
        testCallback.should.have.been.calledWith(new Error('No files found'));
      });

    });

    context('with files given', function(){

      var testCallback = sinon.spy();

      before(function(){
        eslint.CLIEngine = function(){
          return {
            executeOnFiles: function(){
              return {};
            },
            getFormatter: function(){
              return function(){};
            }
          };
        };
        makeup._checkFiles(['imaginary.js'], testCallback);
      });

      it('runs the callback', function(){
        testCallback.should.have.been.called();
      });

      it('does not give the callback an error', function(){
        (typeof testCallback.args[0][0]).should.equal('undefined');
      });

      it('gives the callback a results object', function(){
        Object.keys(testCallback.args[0][1]).should.deep.equal(['errors', 'warnings', 'formatted']);
      });

    });
  });

});
