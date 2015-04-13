// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
module.exports = function( grunt ) {

	grunt.initConfig( {
		yaml_validator: {
			lint_everything: {
				src: [ 'configs/*.yml' ]
			}
		},
		jsonlint: {
			sample: {
				src: [ 'configs/*.json' ]
			}
		},
		jshint: {
			options: {
				jshintrc: 'configs/jshintrc.json'
			},
			core: {
				src: ['*.js']
			},
			test: {
				src: ['test/**/*.js']
			}
		},
		jscs: {
			options: {
				config: 'configs/jscsrc.json',
				force: 'true'
			},
			src: ['<%= jshint.core.src %>', '<%= jshint.test.src %>']
		}

	} );

	grunt.loadNpmTasks( 'grunt-jsonlint' );
	grunt.loadNpmTasks( 'grunt-yaml-validator' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );

};