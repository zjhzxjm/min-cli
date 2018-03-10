import eslint from 'eslint'
const formatter = require('eslint-friendly-formatter')

export default function (options: any, pattern: string) {
  if (!options.formatter) {
    options.formatter = formatter
  }
  options.output = options.output === undefined ? true : options.output
  const engine = new eslint.CLIEngine(options)
  const report = engine.executeOnFiles([pattern]) // https://eslint.org/docs/developer-guide/nodejs-api#cliengineexecuteonfiles
  // const formatter = engine.getFormatter('stylish') // https://eslint.org/docs/developer-guide/nodejs-api#clienginegetformatter
  let rst = formatter(report.results)
  if (rst && options.output) {
    console.log(rst)
  }
  return rst
}
