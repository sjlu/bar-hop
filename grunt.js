module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-recess');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-coffee');

	var recessOptions = function(bool) {
		bool = ((typeof bool === 'undefined')? false : bool);
		var config = {
			compile: true,
			compress: bool,
			noIDs: false,
			noJSPrefix: false,
			noOverqualifying: false,
			noUnderscores: false,
			noUniversalSelectors: false,
			prefixWhitespace: false,
			strictPropertyOrder: false,
			zeroUnits: false
		};

		return config;
	}

	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {},
		server: {
			port: 8000,
			base: 'public/'
		},
		files: {
			less: [
				'assets/less/base.less'
			],
			coffee: [
				'assets/coffee/*.coffee'
			],
			html: [
				'*.html'
			]
		},
        coffee: {
            app: {
                    src: '<config:files.coffee>',
                    dest: 'public/assets/js',
                    options: {
                            bare: true
                    }
            }
        },
		concat: {
			js: {
				src: 'public/assets/js/*.js',
				dest: 'public/assets/app.js'
			}
		},
		min: {
			js: {
				src: 'public/assets/js/*.js',
				dest: 'public/assets/app.js'
			}
		},
		recess: {
			min: {
				src: '<config:files.less>',
				dest: 'public/assets/style.css',
				options: recessOptions(true)
			},
			max: {
				src: '<config:files.less>',
				dest: 'public/assets/style.css',
				options: recessOptions(false)
			}
		},
		shell: {
			sync: {
	            command: 'rm -rf public/; mkdir -p public/assets/font; mkdir -p public/assets/img; mkdir -p public/assets/js; cp assets/raw/font-awesome/font/* public/assets/font/; cp assets/raw/twitter-bootstrap/img/* public/assets/img/; cp *.html public/; cp assets/img/* public/assets/img/; cp CNAME public/',
	            stdout: true
			},
			deploy: {
	            command: 'git stash; git push origin :gh-pages; git branch -D gh-pages; git symbolic-ref HEAD refs/heads/gh-pages; rm -rf .git/index /tmp/public /tmp/node_modules /tmp/raw; mv public /tmp; mv node_modules /tmp; mv assets/raw /tmp; git clean -fdx; mv /tmp/public/* .; git add .; git commit -m "auto-generated deployment to gh-pages"; git checkout master; mv /tmp/node_modules .; cp -R /tmp/raw assets/; git stash apply',
	            stdout: true
			}
		},
		watch: {
			img: {
				files: ['assets/img/*'],
				tasks: 'shell:sync coffee concat recess:max'
			},
			less: {
				files: ['assets/less/*.less', 'assets/less/**/*.less'],
				tasks: 'shell:sync coffee concat recess:max'
			},
			coffee: {
				files: '<config:files.coffee>',
				tasks: 'shell:sync coffee concat recess:max'
			},
			html: {
				files: '<config:files.html>',
				tasks: 'shell:sync coffee concat recess:max'
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true
			}
		},
		uglify: {}
	});

	// Default task.
	grunt.registerTask('default', 'shell:sync coffee concat recess:max server watch');
  	grunt.registerTask('deploy', 'shell:sync coffee min recess:min shell:deploy');
};
