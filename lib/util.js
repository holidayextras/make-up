'use strict';
var util = module.exports = {};

// Format filenames the same way as the js glob functions
util.addRootLevelSlashes = function(pathname) {
  return pathname.replace(/^[^\/]+$/, './$&');
};
