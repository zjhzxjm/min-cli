import sass from 'node-sass'
import { CompilerHelper } from '@mindev/min-core'

export default function (options: CompilerHelper.Options): Promise<sass.Result> {
  let { filename, extend = {}, config: $config } = options
  let { content = '' } = extend

  let config: sass.Options = Object.assign({}, $config, {
    data: content,
    file: filename
  })

  return new Promise((resolve, reject) => {
    sass.render(config, (err: sass.SassError, result: sass.Result) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(result)
      }
    })
  })
}
