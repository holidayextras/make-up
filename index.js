'use strict';

var path = require('path');
var async = require('async');
var streams = require('memory-streams');

var makeUp = module.exports = {};


makeUp.path = function(item) {
  return path.join(__dirname, 'configs', item);
};

makeUp._getIntegrationModule = function(integrationName) {
  try {
    return require(path.join(__dirname, 'lib/integrations', integrationName));
  } catch (e) {
    return null;
  }
};

makeUp._getEnabledIntegrations = function(enabledIntegrationNames) {
  return enabledIntegrationNames
    .map(makeUp._getIntegrationModule)
    .filter(function(integration) {
      return Boolean(integration);
    });
};

makeUp.check = function(options, callback) {
  if (!options.integrations) {
    return callback({ message: 'no integrations enabled' });
  }
  var enabledIntegrationNames = options.integrations.split(',');
  var enabledIntegrations = makeUp._getEnabledIntegrations(enabledIntegrationNames);
  if (!enabledIntegrations.length) {
    return callback({
      message: 'no valid integrations can be enabled from: ' + enabledIntegrationNames.join(', ')
    });
  }
  return async.map(
    enabledIntegrations,
    makeUp._runIntegration.bind(undefined, options),
    function(error, allStreams) {
      var result = allStreams.reduce(function(previous, stream) {
        return previous + stream.toString();
      }, '');
      return callback(error, result);
    }
  );
};

makeUp._runIntegration = function(options, item, callback) {
  var integrationOutput = new streams.WritableStream();
  integrationOutput.write('\n' + item.label + '\n==============\n');
  item.run(options, integrationOutput, callback);
};
