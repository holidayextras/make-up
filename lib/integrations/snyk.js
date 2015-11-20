'use strict';

var snykReport = require('snyk-report');

var SnykIntegration = module.exports = {};

SnykIntegration.run = function(options, callback) {
  snykReport(process.cwd(), function(err, result) {
    console.log('Checking dependencies...');
    if (err) return callback(err);
    console.log(result);
    callback(err, result);
  });
};
