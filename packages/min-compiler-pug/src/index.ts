import * as _ from 'lodash'
import * as pug from 'pug'
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
    extend: {
      code = ''
    } = {},
    config = {}
  } = options

  if (!code) {
    return options
  }

  let templete = pug.compile(code, _.omit(config, ['data']))
  let html = templete(config.data)

  _.merge(options, {
    extend: {
      code: html
    }
  })

  return options
}

export default compiler
