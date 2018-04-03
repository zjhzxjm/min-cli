import * as sass from 'node-sass'
import { util, CompilerHelper } from '@mindev/min-core'

import Compiler = CompilerHelper.Compiler
import Options = CompilerHelper.Options
import Result = CompilerHelper.Result

const compiler: Compiler = (options: Options): Promise<Result> => {
  let { filename, extend = {}, config: $config } = options
  let { code = '' } = extend

  if (!code) {
    return Promise.resolve(options)
  }

  let config: sass.Options = Object.assign({}, $config, {
    data: code,
    file: filename
  })

  return new Promise((resolve, reject) => {
    sass.render(config, (err: sass.SassError, result: sass.Result) => {
      if (err) {
        reject(err)
      }
      else {
        util.merge(options, {
          extend: {
            code: result.css.toString(),
            map: result.map,
            imports: result.stats.includedFiles
          }
        })
        resolve(options)
      }
    })
  })
}

export default compiler
