'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var GithubSinceFilter = require('../../lib/GithubSinceFilter');

describe('GithubSinceFilter', function() {

  describe('_fileIsNewer()', function() {

    context('when the file is found in the github list', function() {

      it('returns true', function() {
        GithubSinceFilter._fileIsNewer(['imaginary.js'], 'imaginary.js').should.be.true();
      });

    });

    context('when the file is not found in the github list', function() {

      it('returns false', function() {
        GithubSinceFilter._fileIsNewer(['real.js'], 'imaginary.js').should.be.false();
      });

    });

  });

  describe('_addRootLevelSlashes()', function() {

    context('with a root level file', function() {

      it('adds slashes', function() {
        GithubSinceFilter._addRootLevelSlashes('imaginary.js').should.equal('./imaginary.js');
      });

    });

    context('with a nested file', function() {

      it('does not change it', function() {
        GithubSinceFilter._addRootLevelSlashes('friend/imaginary.js').should.equal('friend/imaginary.js');
      });

    });

  });

});
