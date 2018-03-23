module.exports = {
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
  lint: {
    eslint: true
  }
}
