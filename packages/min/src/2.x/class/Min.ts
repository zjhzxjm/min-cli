import Base from './Base'
import Watcher from '../observer/watcher'
import $global from '../global'
import { defineReactive } from '../observer'
import { isPlainObject, nextTickForWeapp, warn, noop, toArray, mergeOptions, resolveConstructorOptions } from '../util'
import { initData, initMethods, initComputed, initWatch, callHook, initRender } from '../init'

// 兼容模式下支持代理到原生实例上
const ProxyProperties = [
  'is', 'id', 'data', 'dataset', 'route', 'properties',
  'setData', 'hasBehavior', 'triggerEvent', 'createSelectorQuery', 'selectComponent', 'selectAllComponents', 'getRelationNodes'
]

export default class Min extends Base {

  static options = Object.create(null)
  static nextTick = nextTickForWeapp
  static util = { warn, mergeOptions, defineReactive }
  static _installedPlugins: any[] = []

  $app?: App.Context = null
  $wx?: any = Object.create(null)
  $wxConfig: Weapp.Config = Object.create(null)

  $data: Weapp.Data = Object.create(null)
  $globalData: App.GlobalData = Object.create(null)
  $options: Weapp.Options = null

  _data = Object.create(null)
  _computedWatchers = Object.create(null)
  _watcher: Watcher = null
  _watchers: Watcher[] = []

  _nextTicks: Function[] = []
  _isInit: boolean = false

  readonly _isWeapp = true
  readonly _isComponent: boolean = false

  constructor (options: Weapp.Options, public exts: Weapp.Extends = {}) {
    super()
    this.$options = mergeOptions(
      resolveConstructorOptions(this.constructor),
      options || {},
      this
    ) as Weapp.Options

    if (exts.renderExps) {
      this.$options._renderExps = [...(this.$options._renderExps || []), ...exts.renderExps]
    }

    if (exts.init) {
      this.$init()
    }

    this._proxyNative()
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

  $init () {
    if (this._isInit) return

    this._beforeCreate()
    this._initGlobalDataDef()
    this._initState()
    this._initDataDef()

    if (!this._isComponent) {
      this.$initRender()
    }
    this._isInit = true
  }

  $initRender () {
    if (!this.$wx) return

    initRender(this, (dirtyData, isInit) => {
      if (Object.keys(dirtyData).length > 0) {
        this.$wx.setData(dirtyData, this._flushNextTicks.bind(this))
      }
      else {
        this._flushNextTicks()
      }
    })
  }

  teardown () {
    if (this._watcher) {
      this._watcher.teardown()
      this._watcher = null
    }

    this.$app = null
    this.$wx = null
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

    return nextTickForWeapp(fn, this)
  }

  private _beforeCreate () {
    this.$app = this.$app || $global.$app || null
    callHook(this, 'beforeCreate')
  }

  private _initState () {
    initMethods(this)
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

  private _proxyNative () {
    ProxyProperties.forEach(property => {
      Object.defineProperty(this, property, {
        get () {
          let value = this.$wx[property]
          return typeof value === 'function'
            ? value.bind(this.$wx)
            : value
        }
      })
    })
  }

  private _flushNextTicks () {

    const nextTicks = [...$global._nextTicks, ...this._nextTicks]

    $global._nextTicks.length = 0
    this._nextTicks.length = 0

    for (let i = 0; i < nextTicks.length; i++) {
      nextTicks[i]()
    }
  }
}
