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

To only check files newer than a specific date, use the following option:

    node_modules/.bin/make-up -s 'Sun, 09 Oct 2011 23:24:11 GMT' directory1 directory2
    node_modules/.bin/make-up -s 'Tue Jun 09 2015 14:49:57 GMT+0100 (BST)' directory1 directory2

The `-s` (since) argument can be in any format that the [JS Date](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date) constructor supports.

This will automatically download the lint [ruleset](https://github.com/holidayextras/culture/blob/linting/.eslintrc) from Holiday Extras [culture repo](https://github.com/holidayextras/culture)
and check any JS or JSX files found.

If any errors are found a non zero exit status will be returned equal to the number of errors.

## Developing

Make sure nothings broken before pushing `$ npm test` is good at that.

### Testing eslint configs

The script `script/calculate_eslint_config.js` can be used to show what exact config is used by eslint, this will include any autogenerated rules. This
script expects one argument, which is a eslint config file.
