'use strict';

require('dotenv').load({silent: true});

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    SERVER_IP: process.env.SERVER_IP || '127.0.0.1',
    SERVER_PORT: process.env.SERVER_PORT || 9000,
    API_URL: process.env.API_URL,
    MAP_LAT: process.env.MAP_LAT,
    MAP_LNG: process.env.MAP_LNG,
    MAP_ZOOM: process.env.MAP_ZOOM,
    SENTRY_DSN: process.env.SENTRY_DSN,
    GOOGLE_ANALYTICS: process.env.GOOGLE_ANALYTICS,
    FLOWS_ENABLED: process.env.FLOWS_ENABLED,
    NAMESPACES_ENABLED: process.env.NAMESPACES_ENABLED,
    DEFAULT_CITY: process.env.DEFAULT_CITY,
    DEFAULT_COUNTRY: process.env.DEFAULT_COUNTRY,
    DEFAULT_STATE: process.env.DEFAULT_STATE,
    ENV: process.env.ENV || process.env.NODE_ENV,
    PAGE_TITLE: process.env.PANEL_PAGE_TITLE || 'PAGE_TITLE',
    ZENDESK_URL: process.env.ZENDESK_URL || 'https://zeladoriaurbana.zendesk.com/hc/pt-br',

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: [],
        tasks: [],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test']
      },
      compass: {
        files: ['<%= yeoman.app %>/assets/styles/{,*/}*.{scss,sass}', '<%= yeoman.app %>/components/{,*/}*.{scss,sass}', '<%= yeoman.app %>/modals/**/*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      ngtemplates: {
        files: ['<%= yeoman.app %>/components/cubesviewer/**/**.html', '<%= yeoman.app %>/routes/business-reports/edit/components/chart/explorer-template.html'],
        tasks: ['ngtemplates']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '<%= yeoman.app %>/**/*.template.html',
          '.tmp/assets/styles/{,*/}*.css',
          '.tmp/components/**/**.js',
          '<%= yeoman.app %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        hostname: '<%= SERVER_IP %>',
        port: '<%= SERVER_PORT %>',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          hostname: '<%= SERVER_IP %>',
          port: '<%= SERVER_PORT %>',
          base: '<%= yeoman.dist %>'
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/**/*.route.js',
        '<%= yeoman.app %>/**/*.controller.js',
        '<%= yeoman.app %>/**/*.filter.js',
        '<%= yeoman.app %>/**/*.directive.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 version', '> 10%']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/assets/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/assets/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: '<%= yeoman.app %>/index.html'
      },
      options: {
        directory: '<%= yeoman.app %>/bower_components',
        ignorePath: '<%= yeoman.app %>/',
        exclude: ['/ckeditor/', '/base64image_1.3/', '/font_4.5.1/', '/imagepaste_1.1.1/', '/bootstrapck_1.0_0/', '/tableresize_4.5.1/', '/colorbutton_4.5.3/', '/print_4.5.3/'],
        overrides: {
          "bootstrap": {
            "main": [
              "dist/css/bootstrap.css"
            ]
          },
          "bootstrap-submenu": {
            "main": [
              "dist/css/bootstrap-submenu.css",
              "dist/js/bootstrap-submenu.js"
            ]
          },
          "font-awesome": {
            "main": [
              "css/font-awesome.css"
            ]
          },
          "js-rich-marker": {
            "main": [
              "src/richmarker-compiled.js"
            ]
          },
          "select2": {
            "main": [
              "select2.js",
              "select2_locale_pt-BR.js",
              "select2.css",
              "select2.png",
              "select2x2.png",
              "select2-spinner.gif"
            ]
          }
        }
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/assets/styles',
        cssDir: '.tmp/assets/styles',
        generatedImagesDir: '.tmp/assets/images/generated',
        imagesDir: '<%= yeoman.app %>/assets/images',
        javascriptsDir: '<%= yeoman.app %>/',
        fontsDir: '<%= yeoman.app %>/assets/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/assets/images',
        httpGeneratedImagesPath: '/assets/images/generated',
        httpFontsPath: '/assets/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/assets/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    ngtemplates: {
      dev: {
        cwd: '<%= yeoman.app %>/components/cubesviewer',
        src: ['**/**.html', '<%= yeoman.app %>/routes/business-reports/edit/components/chart/explorer-template.html'],
        dest: '.tmp/components/cubesviewer/cubesviewer.templates.js',
        options: {
          module: "cv",
          htmlmin: {
            collapseBooleanAttributes:      false,
            collapseWhitespace:             false,
            removeAttributeQuotes:          true,
            removeComments:                 true,
            removeEmptyAttributes:          false,
            removeRedundantAttributes:      false,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/**/*.route.js',
          '<%= yeoman.dist %>/**/*.controller.js',
          '<%= yeoman.dist %>/**/*.directive.js',
          '<%= yeoman.dist %>/**/*.filter.js',
          '!<%= yeoman.dist %>/config/main.constants.js',
          '<%= yeoman.dist %>/assets/scripts/{,*/}*.js',
          '!<%= yeoman.dist %>/assets/scripts/ckeditor/**',
          '<%= yeoman.dist %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/assets/images/icons/{,*/}*.{png,jpg,jpeg,gif,webp,svg}', // icons won't be modified
          '!<%= yeoman.dist %>/assets/images/logos/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/assets/images/logo-dark.png',
          '!<%= yeoman.dist %>/assets/images/logo-light.png',
          '<%= yeoman.dist %>/assets/fonts/*',
          '<%= yeoman.dist %>/assets/styles/{,*/}*.css',
          '!<%= yeoman.dist %>/assets/styles/theme.css'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: [
        '<%= yeoman.dist %>/{,*/}*.html',
        '<%= yeoman.dist %>/**/*.template.html'
      ],
      css: [
        '<%= yeoman.dist %>/assets/styles/{,*/}*.css'
      ],
      js: [
        '<%= yeoman.dist %>/**/*.route.js',
        '<%= yeoman.dist %>/**/*.controller.js',
        '<%= yeoman.dist %>/**/*.filter.js',
        '<%= yeoman.dist %>/**/*.directive.js'
      ],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>',
          '<%= yeoman.dist %>/assets/images',
          '<%= yeoman.dist %>/assets/fonts'
        ],
        patterns: {
          // FIXME While usemin won't have full support for revved files we have to put all references manually here
          js: [
            [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/assets/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/assets/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/assets/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/assets/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: false,
          removeCommentsFromCDATA: true,
          removeOptionalTags: false
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', '**/*.template.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/assets/scripts',
          src: '*.js',
          dest: '.tmp/concat/assets/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      desenv: {
        files: [
          {
            src: 'dist/cubesviewer/cubesviewer.css',
            dest: '.tmp/assets/styles/cubesviewer.css'
          },
          {
            src: 'dist/cubesviewer/grid.css',
            dest: '.tmp/assets/styles/grid.css'
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/base64image_1.3',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/base64image',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/font_4.5.1',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/font',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/imagepaste_1.1.1',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/imagepaste',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/bootstrapck_1.0_0',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/skins/bootstrapck',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/tableresize_4.5.1',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/tableresize',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/colorbutton_4.5.3',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/colorbutton',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/print_4.5.3',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/print',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/justify',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/justify',
            src: ['**/*']
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/components/ckeditor-custom-plugins/zupplaceholder',
            dest: '<%= yeoman.app %>/bower_components/ckeditor/plugins/zupplaceholder',
            src: ['**/*']
          }
        ]

      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            '**/*.template.html',
            'assets/images/**/*',
            'assets/fonts/*',
            'assets/scripts/*',
            'assets/documents/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/ckeditor',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/base64image_1.3',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/base64image',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/font_4.5.1',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/font',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/imagepaste_1.1.1',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/imagepaste',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/bootstrapck_1.0_0',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/skins/bootstrapck',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/tableresize_4.5.1',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/tableresize',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/colorbutton_4.5.3',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/colorbutton',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/print_4.5.3',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/print',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/justify',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/justify',
          src: ['**/*']
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/components/ckeditor-custom-plugins/zupplaceholder',
          dest: '<%= yeoman.dist %>/assets/scripts/ckeditor/plugins/zupplaceholder',
          src: ['**/*']
        },{
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/angular-ui-grid',
          dest: '<%= yeoman.dist %>/assets/styles',
          src: ['**/*.{eof,ttf,woff}']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/assets/styles',
        dest: '.tmp/assets/styles/',
        src: '{,*/}*.css'
      }
    },

    ngconstant: {
      options: {
        name: 'config'
      },
      angularLocal: {
        options: {
          dest: '<%= yeoman.app %>/config/main.constants.js',
          space: '  ',
          wrap: '"use strict";\n\n {%= __ngModule %}',
          name: 'config'
        },
        constants: {
          ENV: {
            name: 'development',
            apiEndpoint: '<%= API_URL %>',
            mapLat: '<%= MAP_LAT %>',
            mapLng: '<%= MAP_LNG %>',
            mapZoom: '<%= MAP_ZOOM %>',
            flowsEnabled: '<%= FLOWS_ENABLED %>',
            namespacesEnabled: '<%= NAMESPACES_ENABLED %>',
            defaultCity: '<%= DEFAULT_CITY %>',
            defaultState: '<%= DEFAULT_STATE %>',
            defaultCountry: '<%= DEFAULT_COUNTRY %>',
            pageTitle: '<%= PAGE_TITLE %>',
            zendeskUrl: '<%= ZENDESK_URL %>',
            ckeditorPath: 'bower_components/ckeditor/ckeditor.js',
            version: '<%= pkg.version %>'
          }
        }
      },

      angularBuild: {
        options: {
          dest: '<%= yeoman.dist %>/config/main.constants.js',
          space: '  ',
          wrap: '"use strict";\n\n {%= __ngModule %}',
          name: 'config'
        },
        constants: {
          ENV: {
            name: 'production',
            apiEndpoint: '<%= API_URL %>',
            mapLat: '<%= MAP_LAT %>',
            mapLng: '<%= MAP_LNG %>',
            mapZoom: '<%= MAP_ZOOM %>',
            flowsEnabled: '<%= FLOWS_ENABLED %>',
            namespacesEnabled: '<%= NAMESPACES_ENABLED %>',
            pageTitle: '<%= PAGE_TITLE %>',
            zendeskUrl: '<%= ZENDESK_URL %>',
            ckeditorPath: 'assets/scripts/ckeditor/ckeditor.js',
            version: '<%= pkg.version %>'
          }
        }
      }
    },

    'string-replace': {
      dist: {
        files: {
          '<%= yeoman.dist %>/': '<%= yeoman.dist %>/index.html'
        },
        options: {
          replacements: [{
            pattern: /Raven\.config\(\'.+\', \{\}\)\.install\(\);/,
            replacement: 'Raven.config(\'<%= SENTRY_DSN %>\', {}).install();'
          }, {
            pattern: /gapi\.client\.setApiKey\(\'.+\'\);/,
            replacement: 'gapi.client.setApiKey(\'<%= GOOGLE_ANALYTICS %>\');'
          }, {
            pattern: '<title>Sistema ZUP</title>',
            replacement: '<title><%= PAGE_TITLE %></title>'
          }, {
            pattern: 'ZENDESK_URL',
            replacement: '<%= ZENDESK_URL %>'
          }]
        }
      }
    },

    protractor: {
      options: {
        configFile: "e2e-tests/protractor-conf.js",
        keepAlive: false,
        noColor: false
      },
      all: {}
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'svgmin'
      ]
    }
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'ngtemplates:dev',
      'copy:desenv',
      'ngconstant:angularLocal',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', [
    'build',
    'connect:test',
    'protractor'
  ]);

  grunt.registerTask('dist', [
    'connect:dist',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'ngconstant:angularBuild',
    'ngtemplates:dev',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'string-replace',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
