'use strict';

var should = require('chai')
  .use(require('sinon-chai'))
  .use(require('dirty-chai'))
  .should();
var sinon = require('sinon');
var childProcess = require('child_process');

var git = require('../../lib/git');


describe('git', function() {

  describe('cmd', function() {

    beforeEach(function() {
      sinon.stub(childProcess, 'exec');
    });

    afterEach(function() {
      childProcess.exec.restore();
    });

    context('when child process returns an error code', function() {

      it('should return an error with stderr output', function(done) {
        childProcess.exec.yields(true, '', 'stderr');

        git.cmd('cmd', function(error) {
          error.should.equal('stderr');
          done();
        });
      });

    });

    context('when child process returns an empty string', function() {

      it('should return an empty string', function(done) {
        childProcess.exec.yields(null, '');

        git.cmd('cmd', function(error, output) {
          should.not.exist(error);
          output.should.equal('');
          done();
        });
      });

    });

    context('when child process returns a single line', function() {

      it('should return an output line string', function(done) {
        childProcess.exec.yields(null, 'line');

        git.cmd('cmd', function(error, output) {
          should.not.exist(error);
          output.should.equal('line');
          done();
        });
      });

    });

    context('when child process returns multiple lines', function() {

      it('should return an array of output lines', function(done) {
        childProcess.exec.yields(null, 'line 1\nline 2\nline 3\n');

        git.cmd('cmd', function(error, output) {
          should.not.exist(error);
          output.should.deep.equal(['line 1', 'line 2', 'line 3']);
          done();
        });
      });

    });

  });

  describe('nameOnlyDiff', function() {

    beforeEach(function() {
      sinon.stub(git, 'cmd');
    });

    afterEach(function() {
      git.cmd.restore();
    });

    context('when git command returns an error', function() {

      it('passes it through', function(done) {
        git.cmd.yields('error');

        git.nameOnlyDiff('from', 'to', function(error) {
          error.should.equal('error');
          done();
        });
      });

    });

    context('when git command returns an empty output string', function() {

      it('converts it to an empty array', function(done) {
        git.cmd.yields(null, '');

        git.nameOnlyDiff('from', 'to', function(error, files) {
          should.not.exist(error);
          files.should.deep.equal([]);
          done();
        });
      });

    });

    context('when git command returns a single line output string', function() {

      it('converts it to a one element array', function(done) {
        git.cmd.yields(null, 'line');

        git.nameOnlyDiff('from', 'to', function(error, files) {
          should.not.exist(error);
          files.should.deep.equal(['line']);
          done();
        });
      });

    });

    context('when git command returns a multiple lines output array', function() {

      it('passes it through', function(done) {
        git.cmd.yields(null, ['line 1', 'line 2']);

        git.nameOnlyDiff('from', 'to', function(error, files) {
          should.not.exist(error);
          files.should.deep.equal(['line 1', 'line 2']);
          done();
        });
      });

    });

  });

});
