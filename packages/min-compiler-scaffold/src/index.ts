import { CompilerHelper } from '@mindev/min-core'

export default function (options: CompilerHelper.Options): Promise<void> {
  let { filename, extend = {} } = options
  let p

  try {
    p = Promise.resolve()
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
