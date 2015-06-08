'use strict';

var eslint = require('eslint');
var glob = require('glob-all');
var temp = require('fs-temp');
var https = require('https');
var path = require('path');

var makeUp = {

  path: function( item ) {
    return path.join(__dirname, 'configs', item);
  },

  check: function(dirs, callback){
    var globDirs = dirs.map(function(item){
      return item + '/**/*.js*';
    });
    var globs = ['./*.js'].concat(globDirs);

    var stream = temp.createWriteStream();

    stream.on('path', function(name){
      makeUp.tempConfig = name;
    });

    stream.on('finish', function() {
      stream.close(function(){
        glob(globs, function(error, files){
          if(error) callback(error);
          console.log('Files: ', files);
          makeUp._checkFiles(files, callback);
        });
      });
    });

    https.get("https://raw.githubusercontent.com/holidayextras/culture/linting/.eslintrc", function(response){
      response.pipe(stream);
    });
  },

  _checkFiles: function(files, callback){

    if(!files || !files.length) callback(new Error('No files found'));
    var options = {
      configFile: makeUp.tempConfig,
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
