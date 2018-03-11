import { transformFromAst } from 'babel-core'

export default function (compilerOptions: CompilerOptions): Promise<string> {
  let { filename, ast, content, config } = compilerOptions

  try {
    let result = transformFromAst(ast, content, {
      ast: false,
      babelrc: false,
      filename,
      ...config
    })
    return Promise.resolve(result.code || '')
  }
  catch (err) {
    return Promise.reject(err)
  }
}
