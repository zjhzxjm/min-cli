import pug from 'pug'
import { CompilerHelper } from '@mindev/min-core'

export default function (options: CompilerHelper.Options): Promise<string> {
  let { filename, extend = {}, config } = options
  let { content = '' } = extend
  let { data } = config
  let p = Promise.resolve(content)

  if (!content) {
    return p
  }

  try {
    delete config.data
    let templete = pug.compile(content, config)
    let html = templete(data)
    p = Promise.resolve(html)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
