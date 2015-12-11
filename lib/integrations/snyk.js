'use strict';

var snykReport = require('snyk-report');

var SnykIntegration = module.exports = {};

SnykIntegration.label = 'SNYK Report';

SnykIntegration.run = function(options, output, callback) {
  snykReport('.', function(err, result) {
    if (err) return callback(err, output);
    output.write(result.text);
    callback(output);
  });
};