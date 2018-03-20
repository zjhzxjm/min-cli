import * as _ from 'lodash'
import * as postcss from 'postcss'
import { CompilerHelper } from '@mindev/min-core'

import Compiler = CompilerHelper.Compiler
import Options = CompilerHelper.Options
import Result = CompilerHelper.Result

const compiler: Compiler = async (options: Options): Promise<Result> => {
  let { filename, extend = {}, config = {} } = options
  let { code = '' } = extend
  let p = Promise.resolve(options)

  if (!code) {
    return p
  }

  let plugins: postcss.AcceptedPlugin[] = config.plugins || []

  if (!plugins.length) {
    return p
  }

  try {
    let processor = postcss(plugins)
    let result = await processor.process(code)

    _.merge(options, {
      extend: {
        code: result.css,
        map: result.map
      }
    })
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}

export default compiler
