import { getData, proxy } from './data'
import { observe } from '../observer'
import { warn, isPlainObject, isReserved } from '../util'

function initGlobalDataDef (ctx: App.Context) {
  const globalDataDef: any = {}
  globalDataDef.get = function () {
    return this._globalData
  }

  if (process.env.NODE_ENV !== 'production') {
    globalDataDef.set = function () {
      warn(`$globalData is readonly.`, ctx)
    }
  }
  Object.defineProperty(ctx, '$globalData', globalDataDef)
}

export function initGlobalData (ctx: App.Context) {
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

  initGlobalDataDef(ctx)
}

export function patchGlobalData (wxConfig: App.Config, globalData: App.GlobalData) {
  if (!globalData) {
    globalData = {}
  }
  wxConfig.globalData = globalData
}
