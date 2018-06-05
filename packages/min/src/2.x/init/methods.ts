import MinComponent from '../class/MinComponent'
import { warn, hasOwn, isReserved, noop, PAGE_EVENT, COMPONENT_EVENT } from '../util'

export function initMethods (ctx: Weapp.Context) {
  const { $options } = ctx
  const { methods = {}, properties = {} } = $options

  Object.keys(methods).forEach(method => {
    if (process.env.NODE_ENV !== 'production') {
      if (methods[method] == null) {
        warn(
          `Method "${method}" has an undefined value in the component definition. ` +
          `Did you reference the function correctly?`,
          ctx
        )
      }
      if (properties && hasOwn(properties, method)) {
        warn(
          `Method "${method}" has already been defined as a prop.`,
          ctx
        )
      }
      if ((method in ctx) && isReserved(method)) {
        warn(
          `Method "${method}" conflicts with an existing Weapp instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }

    ctx[method] = methods[method]
  })
}

export function patchMethods (wxConfig: Weapp.Config, options: Weapp.Options, isComponent: boolean = false) {
  if (!options.methods) {
    options.methods = {}
  }

  const { methods = {} } = options
  const target = isComponent
    ? wxConfig.methods = wxConfig.methods || {}
    : wxConfig

  const EVENT = isComponent
    ? COMPONENT_EVENT
    : PAGE_EVENT

  Object.keys(options).forEach(key => {
    const value = options[key]

    if (key === 'data') return
    if (typeof value !== 'function') return
    if (typeof methods[key] !== 'undefined') return
    if (EVENT.indexOf(key) !== -1) return

    methods[key] = value
  })

  Object.keys(methods).forEach(key => {
    target[key] = function proxyMethod (...args) {
      return methods[key].apply(this.$min, args)
    }
  })
}
