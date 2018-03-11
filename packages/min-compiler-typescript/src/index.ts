import * as ts from 'typescript'

export default function (compilerOptions: CompilerOptions): Promise<any> {
  let { content, config } = compilerOptions
  let p

  try {
    let result = ts.transpileModule(content, config)
    let { outputText } = result
    p = Promise.resolve(outputText)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
