[![Build Status](https://api.shippable.com/projects/54edfc805ab6cc13528dcade/badge?branchName=master)](https://app.shippable.com/projects/54edfc805ab6cc13528dcade/builds/latest)
[![Dev Dependency Status](https://david-dm.org/holidayextras/make-up/dev-status.png)](https://david-dm.org/holidayextras/make-up#info=devDependencies&view=table)

## About

All of the configs for all of the linters.

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

Make sure nothings broken before pushing `$ grunt test` is good at that.