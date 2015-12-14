'use strict';

var path = require('path');
var async = require('async');
var streams = require('memory-streams');
var EslintIntegration = require('./lib/integrations/eslint');
var SnykIntegration = require('./lib/integrations/snyk');

var makeUp = module.exports = {};

makeUp.checkIntegrations = [
  EslintIntegration,
  SnykIntegration
];

makeUp.path = function(item) {
  return path.join(__dirname, 'configs', item);
};

makeUp.check = function(options, callback) {
  async.map(this.checkIntegrations, this._runIntegration.bind(undefined, options), function(error, allStreams) {
    allStreams.forEach(function(stream) {
      console.log(stream.toString());
    });
    callback(error);
  });
};

makeUp._runIntegration = function(options, item, callback) {
  var intStream = new streams.WritableStream();
  intStream.write('\n' + item.label + '\n==============\n');
  item.run(options, intStream, function(err, result) {
    callback(err, result);
  });
};
