'use strict';

require('chai')
  .use(require('sinon-chai'))
  .use(require('dirty-chai'))
  .should();

var util = require('../../lib/util');


describe('addRootLevelSlashes()', function() {

  context('with a root level file', function() {

    it('adds slashes', function() {
      util.addRootLevelSlashes('imaginary.js').should.equal('./imaginary.js');
    });

  });

  context('with a nested file', function() {

    it('does not change it', function() {
      util.addRootLevelSlashes('friend/imaginary.js').should.equal('friend/imaginary.js');
    });

  });
});
