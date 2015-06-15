'use strict';

var eslint = require('eslint');
var glob = require('glob-all');
var temp = require('fs-temp');
var https = require('https');
var path = require('path');
var fs = require('fs');

var RULESETURL = 'https://raw.githubusercontent.com/holidayextras/culture/master/.eslintrc';

var makeUp = {

  path: function(item) {
    return path.join(__dirname, 'configs', item);
  },

  check: function(options, callback) {
    var globDirs = options.dirs.map(makeUp._directoryToGlob);
    var globs = ['./*.js'].concat(globDirs);

    var stream = temp.createWriteStream();

    stream.on('path', function(name) {
      makeUp._tempConfig = name;
    });

    stream.on('finish', function() {
      this.close(function() {
        glob(globs, makeUp._processGlobs.bind(makeUp, options, callback));
      });
    });

    var request = https.get(RULESETURL, function(response) {
      if(response.statusCode !== 200) {
        return callback(new Error('Problem with rule download'));
      }
      response.pipe(stream);
    });
    request.on('error', function(err) {
      callback(err);
    });
  },

  _directoryToGlob: function(item) {
    return item + '/**/*.js*';
  },

  _processGlobs: function(options, callback, error, files) {
    if(error) return callback(error);

    if(options.since) {
      var sinceSeconds = new Date(options.since).getTime();
      files = files.filter(this._fileIsNewer.bind(undefined, sinceSeconds));
    }

    console.log('Files: ', files);
    this._checkFiles(files, callback);
  },

  _fileIsNewer: function(since, file) {
    var stat = fs.statSync(file);
    console.log(stat.mtime);
    var seconds = new Date(stat.mtime).getTime();
    return seconds > since;
  },

  _checkFiles: function(files, callback) {
    if(!files || !files.length) callback(new Error('No files found'));
    var options = {
      configFile: this._tempConfig,
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
  }
};

module.exports = makeUp;
