# grunt-yaml-validator

> Validate Yaml files and enforce a given structure

[![Dependency Status](https://img.shields.io/david-dm/paazmaya/grunt-yaml-validator.svg?style=flat-square)](https://david-dm.org/paazmaya/grunt-yaml-validator)
[![Build Status](https://img.shields.io/drone/paazmaya/grunt-yaml-validator/status.svg?style=flat-square)](https://drone.io/github.com/paazmaya/grunt-yaml-validator/latest)
[![Built with Grunt](http://img.shields.io/badge/Grunt-0.4-blue.svg?style=flat-square)](http://gruntjs.com/)
[![Analytics](https://ga-beacon.appspot.com/UA-2643697-15/grunt-yaml-validator/index)](https://github.com/igrigorik/ga-beacon)

[Yaml](http://yaml.org/) files are parsed via [`js-yaml`](https://github.com/nodeca/js-yaml)
and the structure defined via task configuration is enforced with
[`check-type`](https://github.com/alistairjcbrown/check-type).

## Getting Started

This plugin requires Grunt `~0.4` and Node.js minimum `0.10.0`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to
create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and
use Grunt plugins. Once you're familiar with that process, you may install this
plugin with this command:

```sh
npm install grunt-yaml-validator --save-dev
```

Once the plugin has been installed, it may be enabled inside your
`Gruntfile.js` with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-yaml-validator');
```

In case you are using an automated loader, such as [`jit-grunt`](https://github.com/shootaroo/jit-grunt),
the above line is not needed.

## The "yaml_validator" task

Please note that this project is a [multi task plugin](http://gruntjs.com/creating-tasks#multi-tasks),
so pay special attention for configuring it.

Files to be checked with this plugin, should be defined
[via `src` property](http://gruntjs.com/api/inside-tasks#this.filessrc).

### Overview

In your project's Gruntfile, add a section named `yaml_validator` to the data object passed
into `grunt.initConfig()`.

```js
grunt.initConfig({
  yaml_validator: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      options: {
        // Multi task specific options go here.
      }
      // Target-specific file lists and/or options go here.
      src: []
    },
  },
});
```

### Options

All options are `false` by default which disables their use.

#### options.log

Type: `string`

Default value: `false`

In case the value is not `false`, the given string will be used as log file where all the
task output is written.


#### options.structure

Type: `object`

Default value: `false`

The most complex style of checking validity.


#### options.yaml

Type: `object`

Default value: `false`

Options passed to [`safeload` method of `js-yaml`](https://github.com/nodeca/js-yaml#safeload-string---options-).

Please note that the `onWarning` callback is being used by this plugin and any method written for it,
will be run after the one implemented in this plugin.
The callback get called with two parameters, of which the first is the error in question,
while the second is the file path of the given Yaml file.


#### options.writeJson

Type: `boolean`

Default: `false`

Write the given Yaml file as pretty printed JSON in the same path, just by changing the file extension to `json`.

Please note that any existing JSON files will be cruelly overwritten.


### Usage Examples

#### Default Options

By using the default option values, only the validity of the configured Yaml files are checked.

```js
grunt.initConfig({
  yaml_validator: {
    defaults: {
      src: ['configuration/*.yml', 'other/important/*_stuff.yml']
    }
  }
});
```

#### Logging options

All output is written in the log file as well as to the standard output.

```js
grunt.initConfig({
  yaml_validator: {
    logged: {
      options: {
        log: 'yaml-validator.log'
      },
      src: ['configuration/*.yml', 'other/important/*_stuff.yml']
    }
  }
});
```

#### Structure validation options

In case an array is found, all its members are assumed to have the given structure.
This can be seen in the `classRooms` property, which according to the configuration below,
should be an array, for which all items are objects, which all should have a `name` and `id`
properties, with the given types.

The `teachers` array is made of strings, thus all items in that array must be a string.

```js
grunt.initConfig({
  yaml_validator: {
    custom: {
      options: {
        structure: {
          school: {
            description: 'string',
            code: 'number',
            principal: {
              name: 'string'
            },
            classRooms: [
              {
                name: 'string',
                id: 'number'
              }
            ],
            teachers: [
              'string'
            ]
          }
        }
      },
      src: ['configuration/*.yml', 'other/important/*_stuff.yml']
    }
  }
});
```

#### Warning callback in Yaml parsing options

Using the `options.yaml.onWarning` callback, the possible parsing errors can be retrieved.

```js
grunt.initConfig({
  yaml_validator: {
    custom: {
      options: {
        yaml: {
          onWarning: function (error, filepath) {
            console.log(filepath + ' has error: ' + error);
          }
        }
      },
      src: ['configuration/*.yml', 'other/important/*_stuff.yml']
    }
  }
});
```

#### Write a JSON file option

It is possible to use the `options.writeJson` to have all the files processed,
to be saved in JSON format, in the same file path as the original Yaml files.

```js
grunt.initConfig({
  yaml_validator: {
    custom: {
      options: {
        writeJson: true
      },
      src: ['configuration/*.yml', 'other/important/*_stuff.yml']
    }
  }
});
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint with [ESLint](http://eslint.org) and test your code using unit tests.

Please note that any features or changed will not be merged without working unit tests.

## Release History

* v0.1.0 (2014-10-27) Initial release to the World
* v0.1.1 (2014-10-27) Fix structure type and update documentation
* v0.2.0 (2014-10-27) Log file option
* v0.2.1 (2014-10-27) Remove unused dependency
* v0.2.2 (2014-10-28) Log total number as last in the output string
* v0.3.0 (2014-10-29) Extended `keys` configuration option which was renamed from `structure`
* v0.4.0 (2014-10-30) Added type checking configuration option
* v0.5.0 (2014-10-31) Default option values unified to be false. Multitasking fixed.
* v0.5.1 (2014-11-03) New option to save Yaml files as pretty printed JSON files
* v0.5.2 (2014-11-03) Tag mismatch in earlier version
* v0.6.0 (2014-11-03) New option `structure` to replace `types` and `keys`
* v0.7.0 (2014-11-03) Removed deprecated options `types` and `keys` and report rewording
* v0.7.1 (2014-11-03) Object properties in array are correctly matched
* v0.7.2 (2014-11-03) Undefined key crashes if used
* v0.7.3 (2014-12-17) Try/catch around Yaml parsing to avoid breaking in between files

## License

Copyright (c) Juga Paazmaya, licensed under [the MIT license](LICENSE-MIT)
