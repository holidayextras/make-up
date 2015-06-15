#!/usr/bin/env node

"use strict";

var MakeUp = require('../index');

if(process.argv.length < 2) {
  console.log("Usage: make-up <dir1> [dir2] ... [dirN]");
  process.exit(-1);
}

MakeUp.check(process.argv.slice(2), function(error, results) {
  if(error) throw error;
  console.log(results.formatted);
  process.exit(results.errors);
});
