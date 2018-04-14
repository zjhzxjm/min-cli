import Watcher from './observer/watcher'
import $global from './global'
import { isPlainObject, nextTick, warn, noop, mergeOptions, resolveConstructorOptions } from './util'
import { initData, initMethods, initComputed, initWatch } from './init'

export default class MinBase {
  $app?: App.Context = null
  $wxApp?: any = null
  $wxConfig: Weapp.Config = Object.create(null)

  $data: Weapp.Data = Object.create(null)
  $globalData: App.GlobalData = Object.create(null)
  $options: Weapp.Options = null

  _data = Object.create(null)
  _computedWatchers = Object.create(null)
  _watcher: Watcher = null
  _watchers: Watcher[] = []
  readonly _isWeapp = true

  constructor (options: Weapp.Options) {
    this.$options = mergeOptions(
      resolveConstructorOptions(this.constructor),
      options || {},
      this
    ) as Weapp.Options
  }

  $watch (expOrFn: string | Function, cb: Weapp.WatchCallback, options?: Object | any): Function {
    if (typeof cb === 'string') {
      cb = this[cb]
    }
    else if (Array.isArray(cb)) {
      let unwatchFns = cb.map(handler => {
        return this.$watch(expOrFn, handler, options)
      })
      return function unwatchFn () {
        unwatchFns.forEach(unwatchFn => unwatchFn())
      }
    }
    else if (isPlainObject(cb) && typeof cb === 'object') {
      options = cb
      let handler = cb.handler
      return this.$watch(expOrFn, handler, options)
    }

    if (typeof cb !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        warn(`
          Method "${cb}" has an undefined value in the watch definition.
        `)
      }
      return noop
    }

    options = options || {}
    options.user = true

    const watcher = new Watcher(this, expOrFn, cb, options)

    if (options.immediate) {
      cb.call(this, watcher.value)
    }

    return function unwatchFn () {
      watcher.teardown()
    }
  }

  $nextTick (fn: string | Function) {
    if (typeof fn === 'string') {
      fn = this[fn]
    }

    if (typeof fn !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        warn(`
          Method "${fn}" has an undefined value in the nextTick call.
        `)
      }
      return
    }

    return nextTick(fn, this)
  }

  protected $init () {
    this._initGlobalDataDef()
    this._initState()
    this._initDataDef()
  }

  private _initState () {
    let { $wxConfig } = this
    let { $options } = this

    if (!$options.data) {
      $options.data = {}
    }

    initData(this)
    initMethods(this, $wxConfig)
    initWatch(this)
    initComputed(this)
  }

  private _initDataDef () {
    const dataDef: any = {}
    dataDef.get = function () {
      return this._data
    }

    if (process.env.NODE_ENV !== 'production') {
      dataDef.set = function (newData: Object) {
        warn(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        )
      }
    }
    Object.defineProperty(this, '$data', dataDef)
  }

  private _initGlobalDataDef () {
    const self = this
    const globalDataDef: any = {}
    globalDataDef.get = function () {
      let $app = self.$app || $global.$app
      if ($app) {
        return $app.$globalData
      }
      return {}
    }

    if (process.env.NODE_ENV !== 'production') {
      globalDataDef.set = function () {
        warn(`$globalData is readonly.`, this)
      }
    }
    Object.defineProperty(this, '$globalData', globalDataDef)
  }
}
