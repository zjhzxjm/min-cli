import * as path from 'path'
import * as less from 'less'
import { util, CompilerHelper } from '@mindev/min-core'

import Compiler = CompilerHelper.Compiler
import Options = CompilerHelper.Options
import Result = CompilerHelper.Result

const compiler: Compiler = async (options: Options): Promise<Result> => {
  let { filename, extend = {}, config: $config } = options
  let { code = '' } = extend
  let opath = path.parse(filename)
  let p = Promise.resolve(options)

  if (!code) {
    return p
  }

  try {
    let config: Less.Options = Object.assign({}, $config, {
      filename,
      paths: [opath.dir]
    })
    let result = await less.render(code, config)

    util.merge(options, {
      extend: {
        code: result.css,
        map: result.map,
        imports: result.imports
      }
    })
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}

export default compiler
