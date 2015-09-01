#!/usr/bin/env node

'use strict';

var MakeUp = require('../index');

var argv = require('minimist')(process.argv.slice(2));

var options = {
  dirs: argv._,
  since: argv.s,
  gitSince: argv.g
};
MakeUp.check(options, function(error, results) {
  if (error) throw error;
  console.log(results.formatted);
  process.exit(results.errors); // eslint-disable-line no-process-exit
});
