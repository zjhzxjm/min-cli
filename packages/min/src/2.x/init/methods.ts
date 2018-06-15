import { warn, hasOwn, isReserved, APP_LIFE_CYCLE, PAGE_LIFE_CYCLE, COMPONENT_LIFE_CYCLE } from '../util'

export function initMethods (ctx: Weapp.Context | App.Context) {
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

function patchMethods (output: {[key: string]: any}, options: Weapp.Options | App.Options, LIFE_CYCLE: string[]) {
  if (!options.methods) {
    options.methods = {}
  }

  const { methods = {} } = options

  Object.keys(options).forEach(key => {
    const value = options[key]

    if (key === 'data') return
    if (typeof value !== 'function') return
    if (typeof methods[key] !== 'undefined') return
    if (LIFE_CYCLE.indexOf(key) !== -1) return

    methods[key] = value
  })

  Object.keys(methods).forEach(key => {
    output[key] = function proxyMethod (...args) {
      return methods[key].apply(this.$min, args)
    }
  })
}

export function patchComponentMethods (wxConfig: Weapp.Config, options: Weapp.Options) {
  if (!wxConfig.methods) {
    wxConfig.methods = {}
  }

  patchMethods(wxConfig.methods, options, COMPONENT_LIFE_CYCLE)
}

export function patchPageMethods (wxConfig: Weapp.Config, options: Weapp.Options) {
  patchMethods(wxConfig, options, PAGE_LIFE_CYCLE)
}

export function patchAppMethods (wxConfig: App.Config, options: App.Options) {
  patchMethods(wxConfig, options, APP_LIFE_CYCLE)
}
