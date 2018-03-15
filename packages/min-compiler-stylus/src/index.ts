import path from 'path'
import stylus from 'stylus'
import { CompilerHelper } from '@mindev/min-core'

export default function (compilerOptions: CompilerHelper.Options): Promise<string> {
  let { filename, extend = {}, config } = compilerOptions
  let { content = '' } = extend
  let opath = path.parse(filename)

  if (!content) {
    return Promise.resolve(content)
  }

  let options = Object.assign({}, config, {
    paths: [opath.dir],
    filename: opath.base
  })

  return new Promise ((resolve, reject) => {
    stylus.render(content, options, function (err, css) {
      if (err) {
        reject(err)
      }
      else {
        resolve(css)
      }
    })
  })
}
