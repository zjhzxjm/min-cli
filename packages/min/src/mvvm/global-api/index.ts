

// import config from '../config'
// import { initUse } from './use'
// import { initMixin } from './mixin'
// import { initExtend } from './extend'
// import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
// import { ASSET_TYPES } from 'shared/constants'
// import builtInComponents from '../components/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions
} from '../util/index'

import { defineReactive } from '../observer/index'

export function initGlobalAPI (MVVM: any) {
  // config
  // const configDef: any = {}
  // configDef.get = () => {}
  // if (process.env.NODE_ENV !== 'production') {
  //   configDef.set = () => {
  //     warn(
  //       'Do not replace the MVVM.config object, set individual fields instead.'
  //     )
  //   }
  // }
  // Object.defineProperty(MVVM, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  MVVM.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  MVVM.set = set
  MVVM.delete = del
  MVVM.nextTick = nextTick

  MVVM.options = Object.create(null)
  // ASSET_TYPES.forEach(type => {
  //   MVVM.options[type + 's'] = Object.create(null)
  // })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  MVVM.options._base = MVVM

  // extend(MVVM.options.components, builtInComponents)

  // initUse(MVVM)
  // initMixin(MVVM)
  // initExtend(MVVM)
  // initAssetRegisters(MVVM)
}
