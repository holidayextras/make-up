'use strict';

var async = require('async');
var fs = require('fs');
var https = require('https');
var eslint = require('eslint');
var glob = require('glob-all');

var SinceFilter = require('../SinceFilter');
var gitBranchFilter = require('../gitBranchFilter');

var EslintIntegration = module.exports = {};

EslintIntegration.RULESETURL = 'https://raw.githubusercontent.com/holidayextras/culture/6847b0b871c747f8bfadcb05ce003ac8bd0e44eb/.eslintrc';
EslintIntegration.ESLINTRC = '.eslintrc';
EslintIntegration.GLOBEXTENSION = '*.?(js|jsx)';

EslintIntegration.label = 'ESLint Report';

EslintIntegration.run = function(options, output, callback) {

  if (!Array.isArray(options.dirs)) return callback(new Error('Directory list must be an array'), output);

  var globDirs = options.dirs.map(EslintIntegration._directoryToGlob);
  var globs = ['./' + EslintIntegration.GLOBEXTENSION].concat(globDirs);

  // If rules are already downloaded, just run with what we have
  if (fs.existsSync(EslintIntegration.ESLINTRC)) {
    return glob(globs, EslintIntegration._processGlobs.bind(EslintIntegration, options, output, function(err) {
      callback(err, output);
    }));
  }

  return EslintIntegration._downloadConfig(output, function(error) {
    if (error) return callback(error, output);
    return glob(globs, EslintIntegration._processGlobs.bind(EslintIntegration, options, output, function(err) {
      callback(err, output);
    }));
  });
};

EslintIntegration._downloadConfig = function(output, callback) {
  output.write('Downloading ruleset...\n');
  var stream = fs.createWriteStream(EslintIntegration.ESLINTRC);

  stream.on('finish', function() {
    this.close(function() {
      callback();
    });
  });

  var request = https.get(EslintIntegration.RULESETURL, function(response) {
    if (response.statusCode !== 200) {
      return callback(new Error('Problem with rule download'));
    }
    return response.pipe(stream);
  });
  request.on('error', function(err) {
    callback(err);
  });

};

EslintIntegration._checkFiles = function(files, output, callback) {
  output.write('Checking linting...\n');
  if (!files.length) {
    output.write('No changed files with provided filter(s). All ok.\n');
    return callback();
  }

  output.write('Files:\n  ' + files.join('\n  ') + '\n');

  var options = {
    configFile: EslintIntegration.ESLINTRC,
    useEslintrc: false
  };

  var engine = new eslint.CLIEngine(options);
  var report = engine.executeOnFiles(files);
  var formatter = engine.getFormatter();
  output.write(formatter(report.results));
  if (report.errorCount) {
    return callback(new Error('Failed linting'));
  }

  output.write('...Passed\n');
  return callback();
};

EslintIntegration._directoryToGlob = function(item) {
  return item + '/**/' + EslintIntegration.GLOBEXTENSION;
};

EslintIntegration._getFilters = function(options) {
  var filters = [ ];
  if (!options) return filters;
  if (options.since) {  // Filter files by last modified date
    filters.push(SinceFilter.process.bind(null, options.since));
  }
  if (options.gitBranch) { // Filter files by changes compared to git branch
    filters.push(gitBranchFilter.process.bind(null, options.gitBranch));
  }
  return filters;
};

EslintIntegration._filterFilenames = function(files, filters, callback) {
  if (!filters || !filters.length) return callback(null, files);

  var filterTasks = [ async.apply(filters[0], files) ].concat(filters.slice(1));
  return async.waterfall(filterTasks, callback);
};

EslintIntegration._processGlobs = function(options, output, callback, error, files) {
  if (error) return callback(error);
  if (!files || !files.length) return callback(new Error('No files found'));

  var filters = EslintIntegration._getFilters(options);
  var tasks = [
    async.apply(EslintIntegration._filterFilenames, files, filters),
    function(filteredFiles, cb) {
      EslintIntegration._checkFiles(filteredFiles, output, cb);
    }
  ];
  return async.waterfall(tasks, callback);
};
