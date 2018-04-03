import { transformFromAst } from 'babel-core'
import { util, CompilerHelper } from '@mindev/min-core'

import Compiler = CompilerHelper.Compiler
import Options = CompilerHelper.Options
import Result = CompilerHelper.Result

const noop = (options: Options): Result => {
  return options
}

const compiler: Compiler = (options: Options): Promise<Result> => {
  let { sync = noop } = compiler
  let p = Promise.resolve(options)

  try {
    sync(options)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}

compiler.sync = (options: Options): Result => {
  let { filename, extend = {}, config } = options
  let { ast = null, code = '' } = extend

  if (!ast || !code) {
    return options
  }

  // 如果 config 为 false 只处理语法树转换
  let babelrc = config === false ? false : true

  if (!util.isPlainObject(config)) {
    config = {}
  }

  let result = transformFromAst(ast, code, {
    ast: false,
    babelrc,
    ...config,
    filename
  })

  util.merge(options, {
    extend: {
      ...util.pick(result, ['ast', 'code', 'map'])
    }
  })

  return options
}

export default compiler
