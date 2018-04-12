import { warn, hasOwn, isReserved, noop, PAGE_EVENT, COMPONENT_EVENT } from '../util'

export function initMethods (ctx: Weapp.Context, weappConfig: Weapp.Config) {
  const { $options, _isComponent } = ctx
  const { methods, properties } = $options
  const mountMethods = _isComponent
    ? weappConfig.methods = weappConfig.methods || {}
    : weappConfig
  const EVENT = _isComponent
    ? COMPONENT_EVENT
    : PAGE_EVENT

  // Proxy method in ctx.$options
  Object.keys($options).forEach(option => {
    const fn = $options[option]

    if (EVENT.indexOf(option) !== -1) {
      return
    }

    if (option === 'data') {
      return
    }

    if (typeof fn !== 'function') {
      return
    }

    mountMethods[option] = function () {
      return fn.apply(ctx, arguments)
    }
  })

  // Proxy method in ctx.$options.methods
  Object.keys(methods || []).forEach(method => {
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

    mountMethods[method] = function () {
      const fn = methods[method] || noop

      if (typeof fn !== 'function') {
        return
      }

      return fn.apply(ctx, arguments)
    }
  })
}
