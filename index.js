'use strict';

var eslint = require('eslint');
var glob = require('glob-all');
var temp = require('fs-temp');
var https = require('https');
var path = require('path');
var fs = require('fs');

var RULESETURL = 'https://raw.githubusercontent.com/holidayextras/culture/e9a5285fec17432545085fc0d10110d05782a542/.eslintrc';

var makeUp = module.exports = {};

makeUp.GLOBEXTENSION = '*.?(js|jsx)';
makeUp.ESLINTRC = '.eslintrc';

makeUp.path = function(item) {
  return path.join(__dirname, 'configs', item);
};

makeUp.check = function(options, callback) {
  if (!Array.isArray(options.dirs)) return callback(new Error('Directory list must be an array'));

  var globDirs = options.dirs.map(makeUp._directoryToGlob);
  var globs = ['./' + makeUp.GLOBEXTENSION].concat(globDirs);

  // If rules are already downloaded, just run with what we have
  if (fs.existsSync(makeUp.ESLINTRC)) {
    return glob(globs, makeUp._processGlobs.bind(makeUp, options, callback));
  }

  makeUp._downloadConfig(function(err) {
    if (err) return callback(err);
    glob(globs, makeUp._processGlobs.bind(makeUp, options, callback));
  });
};

makeUp._downloadConfig = function(callback) {
  console.log('Downloading ruleset...');
  var stream = temp.createWriteStream();
  var tempPath;

  stream.on('path', function(name) {
    tempPath = name;
  });

  stream.on('finish', function() {
    this.close(function() {
      // move the downloaded config into the project
      fs.rename(tempPath, makeUp.ESLINTRC, function(err) {
        callback(err);
      });
    });
  });

  var request = https.get(RULESETURL, function(response) {
    if (response.statusCode !== 200) {
      return callback(new Error('Problem with rule download'));
    }
    response.pipe(stream);
  });
  request.on('error', function(err) {
    callback(err);
  });

};

makeUp._directoryToGlob = function(item) {
  return item + '/**/' + makeUp.GLOBEXTENSION;
};

makeUp._processGlobs = function(options, callback, error, files) {
  if (error) return callback(error);
  if (!files || !files.length) return callback(new Error('No files found'));

  if (options.since) {
    var sinceSeconds = new Date(options.since).getTime();
    files = files.filter(this._fileIsNewer.bind(undefined, sinceSeconds));
  }

  this._checkFiles(files, callback);
};

makeUp._fileIsNewer = function(since, file) {
  var stat = fs.statSync(file);
  var seconds = new Date(stat.mtime).getTime();
  return seconds > since;
};

makeUp._checkFiles = function(files, callback) {
  if (!files.length) {
    console.log('No changes files since provided date. All ok.');
    return callback(undefined, {
      errors: 0,
      warnings: 0,
      formatted: ''
    });
  }

  console.log('Checking files: ', files);

  var options = {
    configFile: makeUp.ESLINTRC,
    useEslintrc: false
  };

  var engine = new eslint.CLIEngine(options);
  var report = engine.executeOnFiles(files);
  var formatter = engine.getFormatter();
  callback(undefined, {
    errors: report.errorCount,
    warnings: report.warningCount,
    formatted: formatter(report.results)
  });
};
