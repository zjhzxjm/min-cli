import { loader } from '@mindev/min-core'
import util, { log, config } from './index'

export function eslint (filepath: string) {
  if (!config.lint || !config.lint.eslint) {
    return
  }

  const compiler = loader.load('@mindev/min-lint-eslint')

  if (!compiler) {
    log.warn('未安装 @mindev/min-lint-eslint，执行 npm install @mindev/min-lint-eslint --save-dev 或者在 min.config.js 中关闭 eslint 选项')
    return
  }

  // 使用 eslint
  const esConfig = Object.assign({
    output: false,
    useEslintrc: true,
    extensions: ['.js', config.ext.wxa, config.ext.wxp, config.ext.wxc]
  }, config.lint.eslint === true ? {} : config.lint.eslint)

  esConfig.output = false
  let rst = compiler(esConfig, filepath)
  if (rst) {
    console.log(rst)
  }
}
