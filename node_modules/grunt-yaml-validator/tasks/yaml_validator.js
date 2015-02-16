/**
 * grunt-yaml-validator
 * https://github.com/paazmaya/grunt-yaml-validator
 *
 * Copyright (c) Juga Paazmaya <olavic@gmail.com>
 * Licensed under the MIT license.
 */

'use strict';

var yaml = require('js-yaml');
var check = require('check-type').init();

var YamlValidatore = function YamlValidatore(options, grunt) {
  this.options = options;
  this.logs = [];
  this.nonValidPaths = []; // list of property paths
  this.inValidFilesCount = 0;
  this.grunt = grunt; // need to have reference on the original instance
};


/**
 * Wrapper to call Grunt API and store message for
 * possible later use by writing a log file.
 * @param {string} msg Error message
 * @returns {void}
 */
YamlValidatore.prototype.errored = function errored(msg) {
  this.logs.push(msg);
  this.grunt.log.error(msg);
};


/**
 * Check that the given structure is available.
 * @param {Object} doc Object loaded from Yaml file
 * @param {Object} structure Structure requirements
 * @param {string} parent Address in a dot notation
 * @returns {Array} List of not found structure paths
 */
YamlValidatore.prototype.validateStructure = function validateStructure(doc, structure, parent) {
  var notFound = [],
    current = '',
    notValid; // false or path

  parent = parent || '';

  for (var key in structure) {
    if (!structure.hasOwnProperty(key)) {
      continue;
    }

    current = parent;
    if (!check(structure).is('Array')) {
      current += (parent.length > 0 ? '.' : '') + key;
    }

    var item = structure[key];

    if (item instanceof Array) {
      if (check(doc).has(key) && check(doc[key]).is('Array')) {
        doc[key].forEach(function eachArray(child, index) {
          notValid = validateStructure([child], item, current + '[' + index + ']');
          notFound = notFound.concat(notValid);
        });
      }
      else {
        notFound.push(current);
      }
    }
    else if (typeof item === 'string') {
      notValid = !((check(structure).is('Array') || check(doc).has(key)) && check(doc[key]).is(item));

      // Key can be a index number when the structure is an array, but passed as a string
      notFound.push(notValid ? current : false);
    }
    else if (typeof item === 'object' && item !== null) {
      notValid = validateStructure(doc[key], item, current);
      notFound = notFound.concat(notValid);
    }
  }

  return notFound.filter(function filterFalse(item) {
    return item !== false;
  });
};

/**
 * Read the given Yaml file, load and check its structure.
 * @param {string} filepath Yaml file path
 * @returns {number} 0 when no errors, 1 when errors.
 */
YamlValidatore.prototype.checkFile = function checkFile(filepath) {
  // Verbose output will tell which file is being read
  var data = this.grunt.file.read(filepath),
    hadWarning = 0,
    _self = this;

  var doc;
  try {
    doc = yaml.safeLoad(data, {
      onWarning: function onWarning(error) {
        hadWarning = 1;
        _self.errored(filepath + ' > ' + error);
        if (_self.options.yaml &&
          typeof _self.options.yaml.onWarning === 'function') {
          _self.options.yaml.onWarning.call(this, error, filepath);
        }
      }
    });
  }
  catch (error) {
    this.grunt.warn.error(error);
    return 1;
  }

  if (this.options.writeJson) {
    var json = JSON.stringify(doc, null, '  ');
    this.grunt.file.write(filepath.replace(/yml$/, 'json'), json);
  }

  if (this.options.structure) {
    var nonValidPaths = this.validateStructure(doc, this.options.structure);

    if (nonValidPaths.length > 0) {
      this.errored(filepath + ' is not following the correct structure, missing:');
      this.errored(this.grunt.log.wordlist(nonValidPaths, {color: 'grey'}));
      this.nonValidPaths = this.nonValidPaths.concat(nonValidPaths);
    }
  }

  return hadWarning;
};

/**
 * Create a report out of this, but in reality also run.
 * @param {array} files List of files that have been checked that they exist
 * @returns {void}
 */
YamlValidatore.prototype.validate = function validate(files) {
  var _self = this;
  this.inValidFilesCount = files.map(function mapFiles(filepath) {
    return _self.checkFile(filepath);
  }).reduce(function reduceFiles(prev, curr) {
    return prev + curr;
  });
};

/**
 * Create a report out of this, but in reality also run.
 * @returns {void}
 */
YamlValidatore.prototype.report = function report() {

  if (this.inValidFilesCount > 0) {
    this.errored('Yaml format related errors in ' + this.inValidFilesCount + ' files');
  }

  var len = this.nonValidPaths.length;
  this.errored('Total of ' + len + ' structure validation error' + this.grunt.util.pluralize(len, '/s'));

  if (typeof this.options.log === 'string') {
    this.grunt.file.write(this.options.log, this.grunt.log.uncolor(this.logs.join('\n')));
  }
};

module.exports = function yamlValidator(grunt) {

  grunt.registerMultiTask('yaml_validator', 'Validate Yaml files and enforce a given structure', function registerMulti() {

    // Default options
    var options = this.options({
      log: false,
      structure: false,
      yaml: false,
      writeJson: false
    });

    var files = this.filesSrc.filter(function filterFiles(filepath) {
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file "' + filepath + '" not found.');
        return false;
      }
      return true;
    });

    var validator = new YamlValidatore(options, grunt);
    validator.validate(files);
    validator.report();
  });

};
