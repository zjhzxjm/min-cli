import * as _ from 'lodash'
import { transformFromAst } from 'babel-core'
import { CompilerHelper } from '@mindev/min-core'

import Compiler = CompilerHelper.Compiler
import Options = CompilerHelper.Options
import Result = CompilerHelper.Result

const noop = (options: Options): Result => {
  return options
}

const compiler: Compiler = (options: Options): Promise<Result> => {
  let p = Promise.resolve(options)
  let { sync = noop } = compiler

  try {
    sync(options)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}

compiler.sync = (options: Options): Result => {
  let {
    filename,
    extend: {
      ast = null,
      code = ''
    } = {},
    config
  } = options

  if (!ast || !code) {
    return options
  }

  let result = transformFromAst(ast, code, {
    ast: false,
    babelrc: false,
    ...config,
    filename
  })

  _.merge(options, {
    extend: {
      ..._.pick(result, ['ast', 'code', 'map'])
    }
  })

  return options
}

export default compiler
