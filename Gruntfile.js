var fs = require('fs');
var pkg = require('./package');
var cssPrefix = require('css-prefix');

var minor_version = pkg.version.replace(/\.(\d)*$/, '');
var major_version = pkg.version.replace(/\.(\d)*\.(\d)*$/, '');
var path = require('path');

function  rename_release (v) {
    return function (d, f) {
        var dest = path.join(d, f.replace(/(\.min)?\.js$/, '-'+ v + '$1.js').replace('auth0-', ''));
        return dest;
    };
}

module.exports = function (grunt) {
    grunt.initConfig({
        connect: {
            test: {
                options: {
                    // base: 'test',
                    hostname: '*',
                    base: ['.', 'example', 'example/build', 'build'],
                    port: 9001
                }
            }
        },
        browserify: {
            debug: {
                files: {
                    'build/amido-profile-service.js': ['standalone.js']
                },
                options: {
                    bundleOptions: {
                        debug: true
                    },
                    watch: true,
                    transform: ["ejsify", "brfs", "packageify", "browserify-shim"]
                }
            },
            release: {
                files: {
                    'build/amido-profile-service.js': ['standalone.js']
                },
                options: {
                    transform: ["ejsify", "brfs", "packageify", "browserify-shim"]
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions', 'ff 15', 'opera 12.1', 'ie 8']
            },
            main: {
                src:  'lib/css/main.css',
                dest: 'lib/css/main.css'
            }
        },
        copy: {
            example: {
                files: {
                    'example/amido-profile-service.min.js': 'build/amido-profile-service.min.js',
                    'example/amido-profile-service.js':     'build/amido-profile-service.js'
                }
            },
            release: {
                files: [
                    { expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(pkg.version) },
                    { expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(minor_version) },
                    { expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(major_version) }
                ]
            }
        },
        exec: {
            'uglify': {
                cmd: 'node_modules/.bin/uglifyjs build/amido-profile-service.js  -b beautify=false,ascii_only=true > build/amido-profile-service.min.js',
                stdout: true,
                stderr: true
            },
            'test-inception': {
                cmd: 'node_modules/.bin/mocha ./test/support/characters-inception.test.js',
                stdout: true,
                stderr: true
            },
            'test-integration': {
                cmd: 'node_modules/.bin/zuul -- test/*.js',
                stdout: true,
                stderr: true
            },
            'test-phantom': {
                cmd: 'node_modules/.bin/zuul --ui mocha-bdd --phantom 9999 -- test/*.js',
                stdout: true,
                stderr: true
            }
        },
        clean: {
            css: ['lib/css/main.css', 'lib/css/main.min.css'],
            js: ['release/', 'build/', 'example/amido-profile-service.js'],
            example: ['example/amido-profile-service.js']
        },
        watch: {
            js: {
                files: ['build/amido-profile-service.js'],
                tasks: ['clean:example', 'copy:example'],
                options: {
                    livereload: true
                }
            },
            css: {
                files: [
                    'lib/**/*.less'
                ],
                tasks: ['build'],
                options: {
                    livereload: true
                }
            },
            example: {
                files: ['example/*'],
                tasks: ['less:example'],
                options: {
                    livereload: true
                }
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'release/',
                src: ['**/*'],
                dest: 'release-gzip/'
            }
        },
        aws_s3: {
            options: {
                accessKeyId:     "AKIAJOTIG6ZUOUSPQYIQ",
                secretAccessKey: "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",
                bucket:          "amido-profile-service",
                uploadConcurrency: 5,
                params: {
                    CacheControl: 'public, max-age=300',
                    ContentEncoding: 'gzip' // applies to all the files!
                },
                region: 'eu-west-1'
            },
            clean: {
                files: [
                    { action: 'delete', dest: 'js/amido-profile-service-' + pkg.version + '.js' },
                    { action: 'delete', dest: 'js/amido-profile-service-' + pkg.version + '.min.js' },
                    { action: 'delete', dest: 'js/amido-profile-service-' + major_version + '.js' },
                    { action: 'delete', dest: 'js/amido-profile-service-' + major_version + '.min.js' },
                    { action: 'delete', dest: 'js/amido-profile-service-' + minor_version + '.js' },
                    { action: 'delete', dest: 'js/amido-profile-service-' + minor_version + '.min.js' }
                ]
            },
            publish: {
                files: [
                    {
                        expand: true,
                        cwd:    'release-gzip/',
                        src:    ['**'],
                        dest:   'js/'
                    }
                ]
            }
        },
        /* Checks for outdated npm dependencies before release. */
        outdated: {
            release: {
                development: false
            }
        },
        /* Purge FASTLY cache. */
        fastly: {
            options: {
                key:  process.env.FASTLY_KEY,
                host: process.env.FASTLY_HOST
            },
            purge: {
                options: {
                    urls: [
                        'js/amido-profile-service-' + pkg.version + '.js',
                        'js/amido-profile-service-' + pkg.version + '.min.js',
                        'js/amido-profile-service-' + major_version + '.js',
                        'js/amido-profile-service-' + major_version + '.min.js',
                        'js/amido-profile-service-' + minor_version + '.js',
                        'js/amido-profile-service-' + minor_version + '.min.js'
                    ]
                }
            }
        }
    });

    grunt.registerMultiTask('prefix', 'Prefix css.', function() {
        var done = this.async();
        var that = this;
        fs.readFile(__dirname + '/' + this.data.src, {encoding: 'utf8'}, function (err, data) {
            if (err) { return done(err);  }
            var prefixed = cssPrefix(that.data.prefix, data.toString());
            fs.writeFile(__dirname + '/' + that.data.dest, prefixed, function (err) {
                if (err) { return done(err); }
                done();
            });
        });
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) { grunt.loadNpmTasks(key); }
    }

    grunt.registerTask('css',           ['clean:css', , 'cssmin:minify']);

    grunt.registerTask('js',            ['clean:js', 'browserify:debug', 'exec:uglify', "copy:example"]);
    grunt.registerTask('js-release',    ['clean:js', 'browserify:release', 'exec:uglify', "copy:example"]);
    grunt.registerTask('build',         ['js']);
    grunt.registerTask('build-release', ['js-release']);

    grunt.registerTask('example',       ['less:example', 'connect:example', 'build', 'watch']);
    grunt.registerTask('example-https', ['less:example', 'connect:example-https', 'build', 'watch']);

    grunt.registerTask('dev',           ['connect:test', 'build', 'watch']);
    grunt.registerTask('integration',   ['exec:test-inception', 'exec:test-integration']);
    grunt.registerTask('phantom',       ['build', 'exec:test-inception', 'exec:test-phantom']);

    grunt.registerTask('cdn',           ['build-release', 'copy:release', 'compress', 'aws_s3:clean', 'aws_s3:publish']);
};