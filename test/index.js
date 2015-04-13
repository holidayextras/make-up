/* jslint node: true */
/* jshint -W030 */ /* Stop linter complaining about expression */
'use strict';

var chai = require( 'chai' );
var should;
should = chai.should();
var path = require( 'path' );
var makeup = require( '../index.js' );

describe( 'makeup', function() {

	it( 'should return a function', function() {
		makeup.should.be.a( 'function' );
	} );

	it( 'should return a function', function() {
		var expectedPath = path.resolve( __dirname, '../' ) + '/configs/configReader';
		makeup( 'configReader' ).should.equal( expectedPath );
	} );

} );