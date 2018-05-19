import Watcher from '../observer/watcher'
import $global from '../global'
import { handleError } from '../util'
import { noop, APP_EVENT, PAGE_EVENT, COMPONENT_EVENT, parsePath, isPlainObject } from '../util'

export function initAppLifecycle (ctx: App.Context, wxAppConfig: App.Config) {
  const { $options } = ctx

  // Proxy lifecycle
  Object.keys($options).forEach(hook => {

    if (APP_EVENT.indexOf(hook) === -1 || hook === 'onLaunch') {
      return
    }

    // Proxy each lifecycle
    wxAppConfig[hook] = function proxyLifecycleHook () {
      callHook(ctx, hook, arguments)
    }
  })

  // Proxy onLaunch
  wxAppConfig.onLaunch = function proxyLifecycleHook () {
    const $wxApp = this

    ctx.$wxApp = $wxApp
    $wxApp.$app = ctx

    callHook(ctx, 'onLaunch', arguments)
  }
}

export function initPageLifecycle (ctx: Page.Context, wxPageConfig: Page.Config) {
  const { $options } = ctx

  // Proxy lifecycle
  Object.keys($options).forEach(hook => {

    if (PAGE_EVENT.indexOf(hook) === -1 || hook === 'onLoad' || hook === 'onUnload') {
      return
    }

    // Proxy each lifecycle
    wxPageConfig[hook] = function proxyLifecycleHook () {
      callHook(ctx, hook, arguments)
    }
  })

  // Create Render Watcher
  // Get Data、Properties、Computed
  // Set WxConfig.data = {...}

  // function beforeCreate () {
  //   const { $app } = $global
  //   ctx.$app = ctx.$app || $app
  //   ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
  //   callHook(ctx, 'beforeCreate')
  // }

  // beforeCreate()

  createRenderWatcher(ctx, (dirtyData, isInit) => {
    let { $wxPage } = ctx

    if (isInit) {
      wxPageConfig.data = dirtyData
    }
    else if ($wxPage) {
      try {
        $wxPage.setData(dirtyData)
      }
      catch (err) {
        console.error(err)
      }
    }
  })

  // Proxy onLoad
  wxPageConfig.onLoad = function proxyLifecycleHook () {
    // const { $app } = $global
    const $wxPage = this

    // ctx.$app = ctx.$app || $app
    // ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
    ctx.$wxPage = $wxPage
    $wxPage.$page = ctx

    callHook(ctx, 'onLoad', arguments)
  }

  // Proxy onUnload
  wxPageConfig.onUnload = function proxyLifecycleHook () {
    try {
      callHook(ctx, 'onUnload', arguments)
    }
    catch (err) {
      throw err
    }
    finally {
      if (ctx._watcher) {
        ctx._watcher.teardown()
        ctx._watcher = null
      }

      ctx.$app = null
      ctx.$wxApp = null
      ctx.$wxPage = null
      this.$page = null
    }
  }
}

export function initComponentLifecycle (ctx: Component.Context, wxCompConfig: Component.Config) {
  const { $options } = ctx

  // Proxy lifecycle
  Object.keys($options).forEach(hook => {

    if (COMPONENT_EVENT.indexOf(hook) === -1 || hook === 'created' || hook === 'detached') {
      return
    }

    // Proxy each lifecycle
    wxCompConfig[hook] = function proxyLifecycleHook () {
      callHook(ctx, hook, arguments)
    }
  })

  // function beforeCreate () {
  //   const { $app } = $global
  //   ctx.$app = ctx.$app || $app
  //   ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
  //   callHook(ctx, 'beforeCreate')
  // }

  // beforeCreate()

  createRenderWatcher(ctx, (dirtyData, isInit) => {
    let { $wxComponent } = ctx
    if (isInit) {
      wxCompConfig.data = dirtyData
    }
    else if ($wxComponent) {
      try {
        $wxComponent.setData(dirtyData)
      }
      catch (err) {
        console.error(err)
      }
    }
  })

  function getWxPage (wxComponent: any) {
    const { __wxWebviewId__ } = wxComponent
    const pages = getCurrentPages()
    for (const page of pages) {
      if (page.__wxWebviewId__ === __wxWebviewId__) {
        return page
      }
    }
    return null
  }

  // Proxy created
  wxCompConfig.created = function proxyLifecycleHook () {
    // const { $app } = $global
    const $wxComponent = this
    const $wxPage = getWxPage($wxComponent)

    // ctx.$app = ctx.$app || $app
    // ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
    ctx.$wxComponent = $wxComponent
    ctx.$root = $wxPage ? $wxPage.$page : null
    ctx.$wxRoot = $wxPage

    callHook(ctx, 'created', arguments)
  }

  // Proxy detached
  wxCompConfig.detached = function proxyLifecycleHook () {
    try {
      callHook(ctx, 'detached', arguments)
    }
    catch (err) {
      throw err
    }
    finally {
      if (ctx._watcher) {
        ctx._watcher.teardown()
        ctx._watcher = null
      }

      ctx.$app = null
      ctx.$wxApp = null
      ctx.$wxComponent = null
      ctx.$root = null
      ctx.$wxRoot = null
    }
  }
}

function createRenderWatcher (ctx: Weapp.Context, watchDirtyFn: (dirtyData: Object, isInit: Boolean) => void) {
  let { $options } = ctx
  let cached = {}
  let isInit = true

  function getExpReg (exp: string) {
    exp = exp.replace(/(\.|\[|\])/g,'\\$1')

    return new RegExp(`^${exp}(\\.|\\[)`)
  }

  function pushCache (exp, value) {
    // @ts-ignore
    let { __ob__ } = value || {}

    if (__ob__) {
      delete __ob__.renderDirty
    }

    if (isPlainObject(value)) {
      Object.keys(value).forEach(key => pushCache(`${exp}.${key}`, value[key]))
    }
    else if (Array.isArray(value)) {
      value.forEach((item, index) => pushCache(`${exp}[${index}]`, item))
    }
    else {
      cached[exp] = value
    }
  }

  function removeCache (exp) {
    // a.b => /^a\.b(\.|\[)/
    // a[b] => /^a\[b\](\.|\[)/
    let regexp = getExpReg(exp)

    // a.b.c 、a.b[0]
    Object.keys(cached).forEach(key => {
      if (key === exp || regexp.test(key)) {
        delete cached[key]
      }
    })
  }

  function getDirtyData (exp, value) {
    let dirtyData = {}
    if (isPlainObject(value) || Array.isArray(value)) {
      // @ts-ignore
      let { __ob__ } = value

      if (__ob__.renderDirty) { // 数据结构已改变
        dirtyData[exp] = value

        // exp => a.b
        // remove [a.b.c, a.b[0]] from cached
        removeCache(exp)

        // exp => a.b
        // value => { c: { d: 1 } }
        // cached => a.b.c.d = 1
        pushCache(exp, value)
      }
      else {
        let dirtyDatas = []
        if (isPlainObject(value)) {
          dirtyDatas = Object.keys(value).map(key => {
            return getDirtyData(`${exp}.${key}`, value[key])
          })
        }
        else {
          dirtyDatas = value.map((item, index) => {
            return getDirtyData(`${exp}[${index}]`, item)
          })
        }

        dirtyDatas.forEach(data => Object.assign(dirtyData, data))
      }
    }
    else if (value !== cached[exp]) { // 简单数据类型
      dirtyData[exp] = value
      pushCache(exp, value)
    }
    return dirtyData
  }

  let renderWatcher = new Watcher(ctx, () => {
    let dirtyData = {}
    let { _renderExps: renderExps = [] } = $options

    if (isInit) {
      renderExps
      .forEach(exp => {
        let getter = parsePath(exp, true) || noop
        let value = getter.call(ctx, ctx, dirtyData)
        pushCache(exp, value)
      })
    }
    else {
      console.time('time')
      renderExps
      .map(exp => {
        let getter = parsePath(exp, true) || noop
        let value = getter.call(ctx, ctx)
        return getDirtyData(exp, value)
      })
      .forEach(res => Object.assign(dirtyData, res))
      console.timeEnd('time')
    }

    console.group('DirtyData')
    console.log(JSON.parse(JSON.stringify(dirtyData)))
    console.groupEnd()

    // console.group('dirtyCached')
    // console.log(JSON.parse(JSON.stringify(cached)))
    // console.groupEnd()

    if (Object.keys(dirtyData).length > 0) {
      watchDirtyFn(dirtyData, isInit)
    }

    isInit = false
  }, noop, null, true)

  return renderWatcher
}

export function callHook (ctx: Weapp.Context | App.Context, hook: string, args?: IArguments) {
  const handlers = ctx.$options[hook]
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      try {
        handlers[i].apply(ctx, args)
      }
      catch (e) {
        handleError(e, ctx, `${hook} hook`)
      }
    }
  }
}
