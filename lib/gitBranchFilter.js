'use strict';
var gitBranchFilter = module.exports = {};

var _ = {
  intersection: require('lodash.intersection')
};
var async = require('async');
var git = require('./git');
var util = require('./util');

gitBranchFilter.process = function(compareToBranch, files, callback) {
  var tasks = [
    git.currentBranch,
    function(compareFromBranch, cb) {
      return git.nameOnlyDiff(compareFromBranch, compareToBranch, cb);
    }
  ];
  var wfCallback = function(error, changedFiles) {
    if (error) return callback(error);
    var prefixedChangedFiles = changedFiles.map(util.addRootLevelSlashes);
    var filteredChangedFiles = _.intersection(files, prefixedChangedFiles);
    return callback(null, filteredChangedFiles);
  };
  async.waterfall(tasks, wfCallback);
};
