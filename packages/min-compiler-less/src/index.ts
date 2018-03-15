import less from 'less'
import path from 'path'
import { CompilerHelper } from '@mindev/min-core'

export default async function (options: CompilerHelper.Options): Promise<string> {
  let { filename, extend = {}, config: $config } = options
  let { content = '' } = extend
  let opath = path.parse(filename)
  let p = Promise.resolve(content)

  if (!content) {
    return p
  }

  let config: Less.Options = Object.assign({}, $config, {
    filename,
    paths: [opath.dir]
  })

  try {
    let css = await less.render(content, config).then(result => result.css)
    p = Promise.resolve(css)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
