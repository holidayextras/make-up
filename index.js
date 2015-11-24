'use strict';

var path = require('path');
var async = require('async');
var EslintIntegration = require('./lib/integrations/eslint');

var makeUp = module.exports = {};

makeUp.checkIntegrations = [
  EslintIntegration
];

makeUp.path = function(item) {
  return path.join(__dirname, 'configs', item);
};

makeUp.check = function(options, callback) {
  async.map(this.checkIntegrations, this._runIntegration.bind(undefined, options), callback);
};

makeUp._runIntegration = function(options, item, callback) {
  item.run(options, callback);
};
