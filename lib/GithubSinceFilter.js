'use strict';

var fs = require('fs');
var sys = require('sys');
var childProcess = require('child_process');
var moment = require('moment');

var GithubSinceFilter = module.exports = {};

GithubSinceFilter.process = function(since, files, callback) {

  // This will give us a list of all files changed in git since the specified date.
  var cmd = "git diff HEAD 'HEAD@{" + this._formatDate(since) + "}}' --name-only";

  childProcess.exec(cmd, function (error, stdout, stderr) {
    if (error) return callback(error);

    console.log('files: ', files);

    var githubRecent = stdout.split("\n");
    var formattedGithubRecent = githubRecent.map(GithubSinceFilter._addRootLevelSlashes);
    console.log('formatted github: ', formattedGithubRecent);

    var recentFiles = files.filter(GithubSinceFilter._fileIsNewer.bind(undefined, formattedGithubRecent));
    callback(null, recentFiles);
  });

};

// Format filenames the same way as the js glob functions
GithubSinceFilter._addRootLevelSlashes = function(item) {
  return item.replace(/^[^\/]+$/, './$&');
};

// Is the file the glob found in the github list.
GithubSinceFilter._fileIsNewer = function(recent, file) {
  return recent.indexOf(file) > -1;
};

// Dates for the github diff command need to be in an ISO format, which is moment's default.
GithubSinceFilter._formatDate = function(since) {
  var sinceDate = new moment(new Date(since));
  return sinceDate.format();
};
