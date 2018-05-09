const path = require('path');

module.exports = {
  // mode: 'production',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/2.x/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  }
};
