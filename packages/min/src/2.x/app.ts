import $global from './global'
import { warn } from './util'
import { initGlobalData, initAppLifecycle } from './init'

class MinApp implements App.Context {
  $wxApp: any
  $wxConfig: App.Config = {}
  $options: App.Options = null

  $globalData: App.GlobalData = Object.create(null)
  _globalData: App.GlobalData = Object.create(null)

  $store?: Store

  constructor (options: App.Options) {
    this.$options = options

    if (options.store) {
      this.$store = options.store
    }

    this.$init()
  }

  protected $init () {
    initGlobalData(this, this.$wxConfig)
    this._initGlobalDataDef()
    initAppLifecycle(this, this.$wxConfig)
  }

  private _initGlobalDataDef () {
    const globalDataDef: any = {}
    globalDataDef.get = function () {
      return this._globalData
    }

    if (process.env.NODE_ENV !== 'production') {
      globalDataDef.set = function () {
        warn(`$globalData is readonly.`, this)
      }
    }
    Object.defineProperty(this, '$globalData', globalDataDef)
  }
}

export default function createApp (options: App.Options) {
  let app = new MinApp(options)
  $global.$app = app

  return App(app.$wxConfig)
}
