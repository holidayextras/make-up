var path = require( 'path' );
module.exports = function( item ) {
	return path.resolve( __dirname, './configs/' + item );
};