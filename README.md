[![Build Status](https://travis-ci.org/holidayextras/make-up.svg)](https://travis-ci.org/holidayextras/make-up)
[![Dev Dependency Status](https://david-dm.org/holidayextras/make-up/dev-status.png)](https://david-dm.org/holidayextras/make-up#info=devDependencies&view=table)

## About

All of the configs for all of the linters and some third party tools.

## Usage

### Install

```
$ npm install make-up
```

### Consume

```
var makeup = require( 'make-up' );
```

* [scss-lint](https://github.com/ahmednuaman/grunt-scss-lint) - `config: makeup( 'scss-lint.yml' )`
* [jshint](https://github.com/gruntjs/grunt-contrib-jshint) - `config: makeup( 'jshint.json' )`
* [jscs](https://github.com/jscs-dev/grunt-jscs) - `config: makeup( 'jshintrc.json' )`

## Developing

Make sure nothings broken before pushing `$ npm test` is good at that.