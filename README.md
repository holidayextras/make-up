[![Build Status](https://travis-ci.org/holidayextras/make-up.svg)](https://travis-ci.org/holidayextras/make-up)
[![Dependency status](https://david-dm.org/holidayextras/make-up/status.png)](https://david-dm.org/holidayextras/make-up#info=dependencies&view=table)
[![Dev Dependency Status](https://david-dm.org/holidayextras/make-up/dev-status.png)](https://david-dm.org/holidayextras/make-up#info=devDependencies&view=table)

## About

All of the configs for all of the linters.

## Usage

### Install

```
$ npm install make-up
```

### Consume

* [scss-lint](https://github.com/ahmednuaman/grunt-scss-lint) - `config: 'node_modules/make-up/configs/scss-lint.yml'`
* [jshint](https://github.com/gruntjs/grunt-contrib-jshint) - `config: 'node_modules/make-up/configs/jshint.json'`
* [jscs](https://github.com/jscs-dev/grunt-jscs) - `config: 'node_modules/make-up/jscsrc.json'`

## Developing

Make sure nothings broken before pushing `$ grunt test` is good at that.