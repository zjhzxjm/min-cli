import * as _ from 'lodash'
import * as ts from 'typescript'
import { CompilerHelper } from '@mindev/min-core'

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
  let {extend = {}, config = {} } = options
  let { code = '' } = extend

  if (!code) {
    return options
  }

  let result = ts.transpileModule(code, config)

  _.merge(options, {
    extend: {
      code: result.outputText,
      map: result.sourceMapText
    }
  })

  return options
}

export default compiler
