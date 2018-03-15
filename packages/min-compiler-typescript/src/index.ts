import * as ts from 'typescript'
import { CompilerHelper } from '@mindev/min-core'

export default function (options: CompilerHelper.Options): Promise<string> {
  let { extend = {}, config } = options
  let { content = '' } = extend
  let p = Promise.resolve(content)

  if (!content) {
    return p
  }

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
