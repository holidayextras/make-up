'use strict';

var fs = require('fs');
var https = require('https');
var eslint = require('eslint');
var glob = require('glob-all');

var SinceFilter = require('../SinceFilter');
var GitSinceFilter = require('../GitSinceFilter');

var EslintIntegration = module.exports = {};

EslintIntegration.RULESETURL = 'https://raw.githubusercontent.com/holidayextras/culture/87f5c780fa275b827501789f4fa85e51432897a1/.eslintrc';
EslintIntegration.ESLINTRC = '.eslintrc';
EslintIntegration.GLOBEXTENSION = '*.?(js|jsx)';

EslintIntegration.run = function(options, callback) {
  if (!Array.isArray(options.dirs)) return callback(new Error('Directory list must be an array'));

  var globDirs = options.dirs.map(EslintIntegration._directoryToGlob);
  var globs = ['./' + EslintIntegration.GLOBEXTENSION].concat(globDirs);

  // If rules are already downloaded, just run with what we have
  if (fs.existsSync(EslintIntegration.ESLINTRC)) {
    return glob(globs, EslintIntegration._processGlobs.bind(EslintIntegration, options, callback));
  }

  EslintIntegration._downloadConfig(function(err) {
    if (err) return callback(err);
    glob(globs, EslintIntegration._processGlobs.bind(EslintIntegration, options, callback));
  });
};

EslintIntegration._downloadConfig = function(callback) {
  console.log('Downloading ruleset...');
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
    response.pipe(stream);
  });
  request.on('error', function(err) {
    callback(err);
  });

};

EslintIntegration._checkFiles = function(files, callback) {
  console.log('Checking linting...');
  if (!files.length) {
    console.log('No changes files since provided date. All ok.');
    return callback(undefined, {
      errors: 0,
      warnings: 0,
      formatted: ''
    });
  }

  console.log('Files: ', files);

  var options = {
    configFile: EslintIntegration.ESLINTRC,
    useEslintrc: false
  };

  var engine = new eslint.CLIEngine(options);
  var report = engine.executeOnFiles(files);
  var formatter = engine.getFormatter();
  console.log(formatter(report.results));
  if (report.errorCount) {
    callback(new Error('Failed linting'));
  } else {
    console.log('...Passed');
    callback();
  }
};

EslintIntegration._directoryToGlob = function(item) {
  return item + '/**/' + EslintIntegration.GLOBEXTENSION;
};

EslintIntegration._processGlobs = function(options, callback, error, files) {
  if (error) return callback(error);
  if (!files || !files.length) return callback(new Error('No files found'));

  if (options.since) {  // Filter files by last modified date
    SinceFilter.process(options.since, files, function(err, recent) {
      if (err) return callback(err);
      EslintIntegration._checkFiles(recent, callback);
    });
  } else if (options.gitSince) { // Filter files by git history
    GitSinceFilter.process(options.gitSince, files, function(err, recent) {
      if (err) return callback(err);
      EslintIntegration._checkFiles(recent, callback);
    });
  } else {  // No filtering specified
    EslintIntegration._checkFiles(files, callback);
  }

};
