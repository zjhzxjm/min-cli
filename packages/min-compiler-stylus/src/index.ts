import * as path from 'path'
import * as _ from 'lodash'
import * as stylus from 'stylus'
import { CompilerHelper } from '@mindev/min-core'

import Compiler = CompilerHelper.Compiler
import Options = CompilerHelper.Options
import Result = CompilerHelper.Result

const compiler: Compiler = (options: Options): Promise<Result> => {
  let { filename, extend = {}, config: $config } = options
  let { code = '' } = extend
  let opath = path.parse(filename)

  if (!code) {
    return Promise.resolve(options)
  }

  let config = Object.assign({}, $config, {
    filename: opath.base,
    paths: [opath.dir]
  })

  return new Promise ((resolve, reject) => {
    stylus.render(code, config, function (err, css) {
      if (err) {
        reject(err)
      }
      else {
        _.merge(options, {
          extend: {
            code: css
          }
        })
        resolve(options)
      }
    })
  })
}

export default compiler
