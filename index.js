'use strict';

var path = require('path');
var async = require('async');

var makeUp = module.exports = {};

makeUp.checkIntegrations = {
  Eslint: require('./lib/integrations/eslint'),
  Snyk: require('./lib/integrations/snyk')
};

makeUp.path = function(item) {
  return path.join(__dirname, 'configs', item);
};

makeUp.check = function(options, callback) {
  this._options = options;
  async.forEachOf(this.checkIntegrations, this._runIntegration.bind(undefined, options), callback);
};

makeUp._runIntegration = function(options, item, name, callback) {
  item.run(options, callback);
};
