'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var sinon = require('sinon');
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
global.sinon = sinon;

var GitBaseBranchFilter = require('../../lib/GitBaseBranchFilter');

describe('GitBaseBranchFilter', function() {

  describe('_fileIsNewer()', function() {

    context('when the file is found in the github list', function() {

      it('returns true', function() {
        GitBaseBranchFilter._fileIsNewer(['imaginary.js'], 'imaginary.js').should.be.true();
      });

    });

    context('when the file is not found in the github list', function() {

      it('returns false', function() {
        GitBaseBranchFilter._fileIsNewer(['real.js'], 'imaginary.js').should.be.false();
      });

    });

  });

  describe('_addRootLevelSlashes()', function() {

    context('with a root level file', function() {

      it('adds slashes', function() {
        GitBaseBranchFilter._addRootLevelSlashes('imaginary.js').should.equal('./imaginary.js');
      });

    });

    context('with a nested file', function() {

      it('does not change it', function() {
        GitBaseBranchFilter._addRootLevelSlashes('friend/imaginary.js').should.equal('friend/imaginary.js');
      });

    });

  });

});
