import { nativeWatch } from '../util'

export function initWatch (ctx: Weapp.Context) {
  const { $options } = ctx
  const { watch = {} } = $options
  const keys = Object.keys(watch)

  // Some platform has a native watch property
  if (watch === nativeWatch) {
    return
  }

  keys.forEach(key => {
    ctx.$watch(key, watch[key])
  })
}
