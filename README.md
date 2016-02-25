[![Build Status](https://travis-ci.org/holidayextras/make-up.svg)](https://travis-ci.org/holidayextras/make-up)
[![Dev Dependency Status](https://david-dm.org/holidayextras/make-up/dev-status.png)](https://david-dm.org/holidayextras/make-up#info=devDependencies&view=table)

## About

All of the configs for all of the linters and some third party tools.

## Usage

### Install

    npm install make-up --save-dev

Any existing eslint ruleset will be removed from the current directory upon installation.

### Consume

This library's functions can be run programmatically:

```javascript
var makeup = require('make-up');
var options = {
  dirs: []
};
makeup.check(options, function(error, results) {
  ...
});
```

* [scss-lint](https://github.com/ahmednuaman/grunt-scss-lint) - `config: makeup.path( 'scss-lint.yml' )`


Not that if you use Make-up with [scss-lint](https://github.com/brigade/scss-lint/), you need version 0.34+

### Linting

To lint all the files in specific directories run the following:

    node_modules/.bin/make-up directory1 directory2

The current directory is always automatically included.

This will automatically download the lint [ruleset](https://github.com/holidayextras/culture/blob/linting/.eslintrc) from Holiday Extras [culture repo](https://github.com/holidayextras/culture)
and check any JS or JSX files found.

If any errors are found a non zero exit status will be returned equal to the number of errors.

#### Limiting by date

To only check files newer than a specific date, use the following option:

    node_modules/.bin/make-up -s 'Sun, 09 Oct 2011 23:24:11 GMT' directory1 directory2
    node_modules/.bin/make-up -s 'Tue Jun 09 2015 14:49:57 GMT+0100 (BST)' directory1 directory2

The `-s` (since) argument can be in any format that the [JS Date](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date) constructor supports.

#### Limiting by changes compared to git branch

To only check files that were modified in the current git branch compared to a specified git branch (typically `master`), use the `-b` command line switch followed by the branch name as in the following example:

```
node_modules/.bin/make-up -b master directory1 directory2
```

**⚠️Note:** if the `HEAD` branch you're comparing the current branch with is no longer the branch point for the current branch (i.e. new commits were made there meanwhile), this switch will naturally also lint the changed files in the new commits of the branch you're comparing with. You'll need to merge or rebase he compare to branch to go back to linting only the changed files in the current branch.

## Extending

To add a new integration to this project follow the steps below:

1. Create a new js module in the `lib/integrations` directory.
1. Make sure this module exports an object.
1. Create a function named `run` on the new integration object, this will take three arguments; an `options` object, a writable `stream` and `callback` function.
1. The `run` function will output any detail to the user using the provided stream.
1. The `run` function will run the given callback in the usual node manner with the first argument being set as an error object and the second being the given writeable stream.
1. Add the new integration to the `checkIntegrations` object in the `index.js` file.

### Testing eslint configs

The script `script/calculate_eslint_config.js` can be used to show what exact config is used by eslint, this will include any autogenerated rules. This
script expects one argument, which is a eslint config file.

