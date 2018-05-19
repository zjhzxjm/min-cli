import typescript from 'rollup-plugin-typescript2'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

const { NODE_ENV = 'development' } = process.env

const config = {
  input: './src/2.x/index.ts',

  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },

  plugins: [
    typescript({
      tsconfig: 'tsconfig.json'
    })
  ]
}

if (NODE_ENV) {
  config.plugins.push(replace({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
  }))
}

if (NODE_ENV === 'development') {
  config.output.sourceMap = 'inline'
}

if (NODE_ENV === 'production') {
  config.plugins.push(uglify())
}

export default config
