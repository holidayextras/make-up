'use strict';

var childProcess = require('child_process');

var GitBaseBranchFilter = module.exports = {};

GitBaseBranchFilter.process = function(baseBranch, files, callback) {

  if (!baseBranch) return callback(new Error('Base branch required'));

  // This will give us a list of all files changed in the current branch.
  var cmd = 'git diff ' + baseBranch + ' --stat --name-only';

  childProcess.exec(cmd, function(error, stdout) {
    if (error) return callback(error);

    var githubBranchChanges = stdout.split('\n');
    var formattedGitBranchChanges = githubBranchChanges.map(GitBaseBranchFilter._addRootLevelSlashes);
    var recentFiles = files.filter(GitBaseBranchFilter._fileIsNewer.bind(undefined, formattedGitBranchChanges));

    callback(null, recentFiles);
  });

};

// Format filenames the same way as the js glob functions
GitBaseBranchFilter._addRootLevelSlashes = function(item) {
  return item.replace(/^[^\/]+$/, './$&');
};

// Is the file the glob found in the github list.
GitBaseBranchFilter._fileIsNewer = function(recent, file) {
  return recent.indexOf(file) > -1;
};
