import * as path from 'path'
import * as stylus from 'stylus'
import { util, CompilerHelper } from '@mindev/min-core'

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
    let renderer = stylus(code, config)
    let imports = renderer.deps(opath.base)

    renderer.render((err, css) => {
      if (err) {
        reject(err)
      }
      else {
        util.merge(options, {
          extend: {
            code: css,
            imports
          }
        })
        resolve(options)
      }
    })
  })
}

export default compiler
