import * as postcss from 'postcss'
import { CompilerHelper } from '@mindev/min-core'

export default async function (options: CompilerHelper.Options): Promise<string> {
  let { filename, extend = {}, config } = options
  let { content = '' } = extend
  let p = Promise.resolve(content)

  if (!content) {
    return p
  }

  try {
    let plugins: postcss.AcceptedPlugin[] = config.plugins || []
    let css = await postcss(plugins).process(content).then(result => result.css)
    p = Promise.resolve(css)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
