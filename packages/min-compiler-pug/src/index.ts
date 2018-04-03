import * as pug from 'pug'
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
  let { extend = {}, config = {} } = options
  let { code = '' } = extend

  if (!code) {
    return options
  }

  let templete = pug.compile(code, util.omit(config, ['data']))
  let html = templete(config.data)

  util.merge(options, {
    extend: {
      code: html
    }
  })

  return options
}

export default compiler
