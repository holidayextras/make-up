[![Build Status](https://travis-ci.org/holidayextras/make-up.svg)](https://travis-ci.org/holidayextras/make-up)
[![Dev Dependency Status](https://david-dm.org/holidayextras/make-up/dev-status.png)](https://david-dm.org/holidayextras/make-up#info=devDependencies&view=table)

## About

All of the configs for all of the linters and some third party tools.

## Usage

### Install

    npm install make-up

### Consume

    var MakeUp = require( 'make-up' );

#### Path

* [scss-lint](https://github.com/ahmednuaman/grunt-scss-lint) - `config: MakeUp.path( 'scss-lint.yml' )`

#### Check

This will automatically download the lint [ruleset](https://github.com/holidayextras/culture/blob/linting/.eslintrc) from Holiday Extras [culture repo](https://github.com/holidayextras/culture)
and check any JS or JSX files found.

    MakeUp.check(options, function(error, results) {
      if (error) throw error;
      console.log(results.formatted);
    });

### CLI

To lint all the files in a project run the following:

    node_modules/.bin/make-up directory1 directory2

The current directory is always automatically included.

If any errors are found a non zero exit status will be returned equal to the number of errors.

### Options

These apply to both methods of invocation.

#### since (-s)

To only check files newer than a specific date, use the following option:

    node_modules/.bin/make-up -s 'Sun, 09 Oct 2011 23:24:11 GMT' directory1 directory2
    node_modules/.bin/make-up -s 'Tue Jun 09 2015 14:49:57 GMT+0100 (BST)' directory1 directory2

The `-s` (since) argument can be in any format that the [JS Date](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date) constructor supports.

#### extra (-e)

To append to the Holiday Extras's eslint ruleset the path of an additional ruleset can be specified.

    node_modules/.bin/make-up -e path/to/other/eslintrc directory1 directory2

Only new rules and settings specified in the additional ruleset will be used, changes to existing rules will be ignored.

## Developing

Make sure nothings broken before pushing `npm test` is good at that.