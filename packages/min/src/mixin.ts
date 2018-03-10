/**
 * Provide mixins for the WXP page.
 */
import polyfills from './polyfills'
import { PAGE_EVENT } from './const'
import { isArray, isFunction, noop } from './util'

polyfills()

interface Data {
  [key: string]: object
}

interface Methods {
  [key: string]: Function | Function[]
}

interface LifeCycle {
  (opts: object): void
  [key: string]: Function
}

interface Mixin {
  data: Data,
  methods: Methods,
  [key: string]: Function | object
}

interface PageConfig {
  mixins: Mixin[],
  data: Data
  // onLoad: LifeCycle,
  // onBeforeLoad: LifeCycle,
  // onAfterLoad: LifeCycle,
  // onNativeLoad: LifeCycle,
}

// class OnLoad {
//   onBeforeLoad: LifeCycle
//   onNativeLoad: LifeCycle
//   onAfterLoad: LifeCycle
//   onLoad (opts: object) {
//     this.onBeforeLoad(opts)
//     this.onNativeLoad(opts)
//     this.onAfterLoad(opts)
//   }
// }

// reference redux https://github.com/reactjs/redux
function compose (...funcs: Function[]) {
  if (funcs.length === 0) {
    return (arg: any) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  const last = funcs[funcs.length - 1]
  const rest = funcs.slice(0, -1)
  return (...args: any[]) => rest.reduceRight((composed, f) => f(composed), last(...args))
}

// const onLoad = new OnLoad().onLoad

/**
 * Combine data from multiple mixins.
 * @param mixins The WXP mixins
 */
const getMixinData = (mixins: Mixin[]): Data => {
  let ret: Data = {}

  mixins.forEach(mixin => {
    let { data = {} } = mixin

    Object.keys(data).forEach(key => {
      ret[key] = data[key]
    })
  })

  return ret
}

/**
 * Combine methods from multiple mixins.
 * @param mixins The WXP mixins
 */
const getMixinMethods = (mixins: Mixin[]): Methods => {
  let ret: Methods = {}

  mixins.forEach((mixin: Mixin) => {
    let { methods = {} } = mixin

    // Get methods
    Object.keys(methods).forEach(key => {
      let method = methods[key]

      // Ignore not Function
      if (!isFunction(method)) return

      // Ignore lifeCycle onLoad
      // if (key === 'onLoad') return

      ret[key] = method
    })

    // Get lifecycle
    PAGE_EVENT.forEach(key => {
      let method = mixin[key]

      // Ignore not Function
      if (typeof method !== 'function') return

      // Ignore lifeCycle onLoad
      // if (key === 'onLoad') return

      let value = ret[key]

      // Multiple mixins have the same lifecycle and convert methods to array storage.
      if (value && Array.isArray(value)) {
        ret[key] = [...value, method]
      }

      // The method in a mixin is converted into an array store.
      else {
        ret[key] = [method]
      }
    })
  })

  return ret
}

/**
 * Mix data in mixins to the WXP page.
 * @param mixinData Data for mixins in the WXP page.
 * @param nativeData Data for native in the WXP page.
 */
const mixData = (mixinData: Data, nativeData: Data): Data => {
  Object.keys(mixinData).forEach(key => {
    // The native data priority is highest in the WXP page.
    if (nativeData[key] !== undefined) return

    // The later mixin priority is higher.
    nativeData[key] = mixinData[key]
  })

  return nativeData
}

const mixMethods = (mixinMethods: Methods, pageConfig: PageConfig): PageConfig => {
  Object.keys(mixinMethods).forEach((key: string) => {
    let method = mixinMethods[key]

    // On the white list of life cycle functions.
    if (PAGE_EVENT.includes(key)) {
      let methodsList = method

      if (!Array.isArray(methodsList)) return

      if (isFunction(pageConfig[key])) {
        methodsList.push(pageConfig[key])
      }

      // lifecycle不会合并。先顺序执行mixins中的lifecycle，再执行组件自身的lifecycle
      pageConfig[key] = (function (methodsList) {
        return function (...args) {
          compose(...methodsList.reverse().map(f => f.bind(this)))(...args)
        }
      })(methodsList)
    }

    // Common methods
    else {
      if (pageConfig[key] == null) {
        pageConfig[key] = method
      }
    }
  })

  return pageConfig
}

export {
  Data,
  Methods,
  Mixin,
  LifeCycle,
  PageConfig
}

export default (pageConfig: PageConfig) => {

  let {
    mixins = []
    // onBeforeLoad = noop,
    // onAfterLoad = noop
  } = pageConfig

  // let onNativeLoad = pageConfig.onLoad || noop
  let nativeData = pageConfig.data || {}

  let mixinData = getMixinData(mixins)
  let mixinMethods = getMixinMethods(mixins)

  Object.assign(pageConfig, {
    data: mixData(mixinData, nativeData)
    // onLoad,
    // onBeforeLoad,
    // onAfterLoad,
    // onNativeLoad
  })

  pageConfig = mixMethods(mixinMethods, pageConfig)

  return pageConfig
}
