'use strict';
var git = module.exports = {};

var childProcess = require('child_process');

git.cmd = function(gitCmd, callback) {
  var cmd = 'git ' + gitCmd;

  childProcess.exec(cmd, function(error, stdout, stderr) {
    if (error) {
      return callback(stderr);
    }
    var outputLines = stdout.trim().split('\n');
    if (outputLines.length === 1) {
      return callback(null, outputLines[0]);
    }
    return callback(null, outputLines);
  });
};

git.currentBranch = git.cmd.bind(null, 'symbolic-ref --short HEAD');

git.nameOnlyDiff = function(compareFrom, compareTo, callback) {
  var gitCmd = 'diff --name-only ' + compareFrom + ' ' + compareTo;
  git.cmd(gitCmd, function(error, output) {
    if (error) return callback(error);
    if (!output) return callback(null, []);
    return callback(null, [].concat(output));
  });
};
