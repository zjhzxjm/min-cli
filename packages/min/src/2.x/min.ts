import Watcher from './observer/watcher'
import $global from './global'
import { defineReactive } from './observer'
import { isPlainObject, nextTick, warn, noop, toArray, mergeOptions, resolveConstructorOptions } from './util'
import { initData, initMethods, initComputed, initWatch, callHook } from './init'

export default class Min {

  static options = Object.create(null)
  static nextTick = nextTick
  static util = { warn, mergeOptions, defineReactive }
  static _installedPlugins: any[] = []

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

  constructor (options: Weapp.Options, init: boolean = false) {
    this.$options = mergeOptions(
      resolveConstructorOptions(this.constructor),
      options || {},
      this
    ) as Weapp.Options

    if (init) {
      this.$init()
    }
  }

  static mixin (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }

  static use (plugin: Plugin) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    }
    else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
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
    this._beforeCreate()
    this._initGlobalDataDef()
    this._initState()
    this._initDataDef()
  }

  private _beforeCreate () {
    const { $app } = $global
    this.$app = this.$app || $app
    this.$wxApp = this.$wxApp || ($app ? $app.$wxApp : undefined)
    callHook(this, 'beforeCreate')
  }

  private _initState () {
    let { $wxConfig } = this
    let { $options } = this

    if (!$options.data) {
      $options.data = {}
    }

    if (!$wxConfig.data) {
      $wxConfig.data = {}
    }

    initMethods(this, $wxConfig)
    initData(this)
    initComputed(this)
    initWatch(this)
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
