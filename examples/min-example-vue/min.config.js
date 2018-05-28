const config = {
  alias: {
    mixins: 'src/mixins',
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
        'transform-export-extensions',
        'transform-object-rest-spread'
      ]
    }
  },
  plugins: {
    DefinePlugin: {
      config: {}
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  delete config.compilers.babel.sourceMaps
}

module.exports = config
