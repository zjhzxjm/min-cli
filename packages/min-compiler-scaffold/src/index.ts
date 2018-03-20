import * as _ from 'lodash'
import { CompilerHelper } from '@mindev/min-core'

import Compiler = CompilerHelper.Compiler
import Options = CompilerHelper.Options
import Result = CompilerHelper.Result

const compiler: Compiler = (options: Options): Promise<Result> => {
  let { filename, extend = {} } = options
  let p

  try {
    p = Promise.resolve(options)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}

export default compiler
