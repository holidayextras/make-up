'use strict';

module.exports = function( brand, item ) {
	brand = ( brand ) ? brand : 'default';
	return __dirname + '/configs/' + brand + '/' + item;
};