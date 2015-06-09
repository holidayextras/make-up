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

* [scss-lint](https://github.com/ahmednuaman/grunt-scss-lint) - `config: makeup.path( 'scss-lint.yml' )`


### Linting

To lint all the files in a project run the following:

    node_modules/.bin/make-up directory1 directory2

The current directory is always automatically included.

This will automatically download the lint [ruleset](https://github.com/holidayextras/culture/blob/linting/.eslintrc) from Holiday Extras [culture repo](https://github.com/holidayextras/culture)
and check any JS or JSX files found.

If any errors are found a non zero exit status will be returned equal to the number of errors.

## Developing

Make sure nothings broken before pushing `$ npm test` is good at that.