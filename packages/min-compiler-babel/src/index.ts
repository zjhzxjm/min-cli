import { transformFromAst } from 'babel-core'

export default function (compilerOptions: CompilerOptions): Promise<string> {
  let { filename, ast, content, config } = compilerOptions
  let p

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
