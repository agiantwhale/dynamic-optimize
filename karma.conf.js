module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: ['PhantomJS', 'Firefox'],
    frameworks: ['browserify', 'mocha', 'chai'],
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/**/*.js',
      'test/**/*.spec.js'
    ],
    preprocessors: {
      'src/**/*.js': ['browserify'],
      'test/**/*.spec.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: [
        [
          'babelify',
          {
            presets: ['es2015'],
            sourceMapsAbsolute: true
          }
        ],
        [
          'browserify-istanbul',
          {
            instrumenter: require('isparta'),
            instrumenterConfig: { embedSource: true },
            ignore: [
              '**/node_modules/**',
              '**/bower_components/**',
              '**/test/**',
              '**/tests/**',
              '**/*.json'
            ],
            defaultIgnore: true
          }
        ]
      ]
    },
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      reporters: [
        {
          type: 'text-summary'
        },
        {
          type: 'html',
          dir: 'coverage/'
        }
      ]
    }
  });
};
