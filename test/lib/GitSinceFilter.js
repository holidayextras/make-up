'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var GitSinceFilter = require('../../lib/GitSinceFilter');

describe('GitSinceFilter', function() {

  describe('process()', function() {

    context('with an invalid date', function() {

      var testCallback = sinon.spy();

      beforeEach(function() {
        GitSinceFilter.process('before the time began', [], testCallback);
      });

      it('runs the callback', function() {
        testCallback.should.of.been.called();
      });

      it('passes an error to the callback', function() {
        testCallback.should.of.been.calledWith(Error('Invalid date'));
      });

    });

  });

  describe('_fileIsNewer()', function() {

    context('when the file is found in the github list', function() {

      it('returns true', function() {
        GitSinceFilter._fileIsNewer(['imaginary.js'], 'imaginary.js').should.be.true();
      });

    });

    context('when the file is not found in the github list', function() {

      it('returns false', function() {
        GitSinceFilter._fileIsNewer(['real.js'], 'imaginary.js').should.be.false();
      });

    });

  });

  describe('_addRootLevelSlashes()', function() {

    context('with a root level file', function() {

      it('adds slashes', function() {
        GitSinceFilter._addRootLevelSlashes('imaginary.js').should.equal('./imaginary.js');
      });

    });

    context('with a nested file', function() {

      it('does not change it', function() {
        GitSinceFilter._addRootLevelSlashes('friend/imaginary.js').should.equal('friend/imaginary.js');
      });

    });

  });

});
