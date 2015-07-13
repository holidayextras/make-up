'use strict';

// combines two eslint rulesets, the original having priority to existing rules/config.

var fs = require('fs');
var _ = {
  extend: require('lodash.assign')
};

var RulesetCombiner = module.exports = {};

RulesetCombiner.combineFiles = function(originalPath, extraPath, callback) {
  if (!extraPath) return callback();

  fs.readFile(originalPath, 'utf8', function(oErr, oData) {
    if (oErr) return callback(oErr);
    var originalJson = JSON.parse(oData);

    fs.readFile(extraPath, 'utf8', function(eErr, eData) {
      if (eErr) return callback(eErr);
      var extraJson = JSON.parse(eData);

      //only merge keys of original eslint config
      Object.keys(originalJson).forEach(RulesetCombiner._mergeKey.bind(RulesetCombiner, originalJson, extraJson));
      fs.writeFile(originalPath, JSON.stringify(originalJson), callback);
    });

  });

};

RulesetCombiner._mergeKey = function(original, extra, key) {
  if (extra[key]) original[key] = _.extend(extra[key], original[key]);
};
