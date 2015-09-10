'use strict';

var childProcess = require('child_process');
var Moment = require('moment');

var GitSinceFilter = module.exports = {};

GitSinceFilter.process = function(since, files, callback) {

  var sinceDate = new Moment(new Date(since));
  if (!sinceDate.isValid()) return callback(new Error('Invalid date'));

  // This will give us a list of all files changed in git since the specified date.
  // Dates for the github diff command need to be in an ISO format, which is moment's default.
  var cmd = "git diff HEAD 'HEAD@{" + sinceDate.format() + "}}' --name-only";
  childProcess.exec(cmd, function(error, stdout) {
    if (error) return callback(error);

    var githubRecent = stdout.split('\n');
    var formattedGitRecent = githubRecent.map(GitSinceFilter._addRootLevelSlashes);
    var recentFiles = files.filter(GitSinceFilter._fileIsNewer.bind(undefined, formattedGitRecent));

    callback(null, recentFiles);
  });

};

// Format filenames the same way as the js glob functions
GitSinceFilter._addRootLevelSlashes = function(item) {
  return item.replace(/^[^\/]+$/, './$&');
};

// Is the file the glob found in the github list.
GitSinceFilter._fileIsNewer = function(recent, file) {
  return recent.indexOf(file) > -1;
};
