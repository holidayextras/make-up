'use strict';

var should = require('chai')
  .use(require('sinon-chai'))
  .use(require('dirty-chai'))
  .should();
var sinon = require('sinon');

var git = require('../../lib/git');
var gitBranchFilter = require('../../lib/gitBranchFilter');
var util = require('../../lib/util');

describe('gitBranchFilter', function() {

  describe('process', function() {

    beforeEach(function() {
      this.sandbox = sinon.sandbox.create();
      this.sandbox.stub(git, 'currentBranch');
      this.sandbox.stub(git, 'nameOnlyDiff');
      this.sandbox.spy(util, 'addRootLevelSlashes');
    });

    afterEach(function() {
      this.sandbox.restore();
    });

    context('when `git.currentBranch` errors', function() {

      it('callsback with error', function(done) {
        git.currentBranch.yields('error');

        gitBranchFilter.process('compareToBranch', 'files', function(error) {
          error.should.equal('error');
          done();
        });
      });

    });

    context('when `git.nameOnlyDiff` errors', function() {

      it('callsback with error', function(done) {
        git.currentBranch.yields();
        git.nameOnlyDiff.yields('error');

        gitBranchFilter.process('compareToBranch', 'files', function(error) {
          error.should.equal('error');
          done();
        });
      });

    });

    context('when `git` functions succeed', function() {

      it('calls `git.nameOnlyDiff` with the current branch', function(done) {
        git.currentBranch.yields(null, 'currentBranch');
        git.nameOnlyDiff.yields(null, []);

        gitBranchFilter.process('compareToBranch', 'files', function(error) {
          should.not.exist(error);
          git.currentBranch.should.have.been.called();
          git.nameOnlyDiff.should.have.been.calledWith('currentBranch', 'compareToBranch');
          done();
        });
      });

      it('adds root level slashes to `git.nameOnlyDiff` result', function(done) {
        git.currentBranch.yields(null, 'currentBranch');
        git.nameOnlyDiff.yields(null, ['filename']);

        gitBranchFilter.process('compareToBranch', 'files', function(error) {
          should.not.exist(error);
          util.addRootLevelSlashes.should.have.been.calledWith('filename');
          done();
        });
      });

      it('should callback with intersection of files and `git.nameOnlyDiff` result', function(done) {
        git.currentBranch.yields(null, 'currentBranch');
        git.nameOnlyDiff.yields(null, ['a', 'b/c', 'b/d']);

        gitBranchFilter.process('compareToBranch', ['./a', 'b/d', 'c/e'], function(error, files) {
          should.not.exist(error);
          files.should.deep.equal(['./a', 'b/d']);
          done();
        });
      });

    });

  });

});
