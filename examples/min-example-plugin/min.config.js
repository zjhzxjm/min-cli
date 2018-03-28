module.exports = {
  alias: {
    components: 'src/components'
  },
  compilers: {
    babel: {
      sourceMaps: 'inline',
      presets: [
        'env'
      ],
      plugins: [
        'syntax-export-extensions',
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-export-extensions'
      ]
    }
  },
  plugins: {
    AutoprefixerPlugin: {
      config: {
        browsers: ['Android >= 2.3', 'Chrome > 20', 'iOS >= 6']
      }
    },
    DefinePlugin: {
      config: {
        PRODUCTION: true,
        __dev__: true
      }
    },
    FileminPlugin: {
      'config': {

      }
    },
    ImageminPlugin: {
      config: {
        jpg: {},
        png: {
          quality: '5'
        }
      }
    },
    FilesyncPlugin: {
      cwd: 'src/assets',
      from: ['**/*.jpg', '**/*.png'],
      to: '/images'
    },
    UglifyjsPlugin: {
      config: {
        warnings: false
      }
    },
    Unit2rpxPlugin: {
      config: {
        px: 2,
        rem: 1
      }
    }
  }
}
