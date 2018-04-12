import { noop, warn, hasOwn, isPlainObject, isReserved, handleError } from '../util'
import { observe } from '../observer'
import { pushTarget, popTarget } from '../observer/dep'

export const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function initData (ctx: Weapp.Context, weappConfig: Weapp.Config) {
  const { $options } = ctx
  let { data = {} } = $options

  data = ctx._data = typeof data === 'function'
    ? getData(data, ctx)
    : data || {}

  if (!isPlainObject(data)) {
    data = {}

    if (process.env.NODE_ENV !== 'production') {
      warn(
        'data functions should return an object:\n',
        // 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        ctx
      )
    }
  }

  // proxy data on instance
  const keys = Object.keys(data)
  const { properties, methods } = $options

  keys.forEach(key => {
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          ctx
        )
      }
    }
    if (properties && hasOwn(properties, key)) {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          `The data property "${key}" is already declared as a prop. ` +
          `Use prop default value instead.`,
          ctx
        )
      }
    }
    else if (!isReserved(key)) {
      proxy(ctx, `_data`, key)
    }
  })

  // observe data
  observe(data, true /* asRootData */)

  weappConfig.data = data
}

export function initGlobalData (ctx: App.Context, weappConfig: App.Config) {
  const { $options } = ctx
  let { globalData = {} } = $options

  globalData = ctx._globalData = typeof globalData === 'function'
    ? getData(globalData, ctx)
    : globalData || {}

  if (!isPlainObject(globalData)) {
    globalData = {}

    if (process.env.NODE_ENV !== 'production') {
      warn(
        'data functions should return an object:\n',
        // 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        ctx
      )
    }
  }

  // proxy data on instance
  const keys = Object.keys(globalData)
  // const { methods } = $options

  keys.forEach(key => {
    // if (process.env.NODE_ENV !== 'production') {
    //   if (methods && hasOwn(methods, key)) {
    //     warn(
    //       `Method "${key}" has already been defined as a data property.`,
    //       ctx
    //     )
    //   }
    // }
    if (!isReserved(key)) {
      proxy(ctx, `_globalData`, key)
    }
  })

  // observe data
  observe(globalData, true /* asRootData */)

  weappConfig.globalData = globalData
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function getData (data: Function, ctx: any): any {
  // #7573 disable dep collection when invoking data getters
  pushTarget()
  try {
    return data.call(ctx, ctx)
  }
  catch (e) {
    handleError(e, ctx, `data()`)
    return {}
  }
  finally {
    popTarget()
  }
}
