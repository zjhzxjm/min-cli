import { transformFromAst } from 'babel-core'
import { CompilerHelper } from '@mindev/min-core'

export default function (options: CompilerHelper.Options): Promise<string> {
  let { filename, extend = {}, config } = options
  let { ast = null, content = '' } = extend
  let p = Promise.resolve(content)

  if (!ast || !content) {
    return p
  }

  try {
    let result = transformFromAst(ast, content, {
      ast: false,
      babelrc: false,
      filename,
      ...config
    })
    p = Promise.resolve(result.code || '')
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
