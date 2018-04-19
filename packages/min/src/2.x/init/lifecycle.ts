import Watcher from '../observer/watcher'
import $global from '../global'
import { noop, APP_EVENT, PAGE_EVENT, COMPONENT_EVENT, parsePath, isPlainObject } from '../util'

export function initAppLifecycle (ctx: App.Context, wxAppConfig: App.Config) {
  const { $options } = ctx

  // Proxy lifecycle
  Object.keys($options).forEach(option => {
    const fn = $options[option]

    if (APP_EVENT.indexOf(option) === -1 || option === 'onLaunch') {
      return
    }

    if (typeof fn !== 'function') {
      return
    }

    wxAppConfig[option] = function () {
      fn.apply(ctx, arguments)
    }
  })

  // Proxy onLaunch
  wxAppConfig.onLaunch = function () {
    const { onLaunch } = $options
    const $wxApp = this

    ctx.$wxApp = $wxApp
    $wxApp.$app = ctx

    if (typeof onLaunch !== 'function') {
      return
    }

    return onLaunch.apply(ctx, arguments)
  }
}

export function initPageLifecycle (ctx: Page.Context, wxPageConfig: Page.Config) {
  const { $options } = ctx

  // Proxy lifecycle
  Object.keys($options).forEach(option => {
    let fn = $options[option]

    if (PAGE_EVENT.indexOf(option) === -1 || option === 'onLoad' || option === 'onUnload') {
      return
    }

    if (typeof fn !== 'function') {
      return
    }

    wxPageConfig[option] = function () {
      fn.apply(ctx, arguments)
    }
  })

  // Create Render Watcher
  // Get Data、Properties、Computed
  // Set WxConfig.data = {...}

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
  wxPageConfig.onLoad = function () {
    const { onLoad } = $options
    const { $app } = $global
    const $wxPage = this

    ctx.$app = ctx.$app || $app
    ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
    ctx.$wxPage = $wxPage
    $wxPage.$page = ctx

    if (typeof onLoad !== 'function') {
      return
    }

    return onLoad.apply(ctx, arguments)
  }

  // Proxy onUnload
  wxPageConfig.onUnload = function () {
    const { onUnload } = $options

    try {
      if (typeof onUnload === 'function') {
        return onUnload.apply(ctx, arguments)
      }
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
  Object.keys($options).forEach(option => {
    let fn = $options[option]

    if (COMPONENT_EVENT.indexOf(option) === -1 || option === 'created' || option === 'detached') {
      return
    }

    if (typeof fn !== 'function') {
      return
    }

    wxCompConfig[option] = function () {
      fn.apply(ctx, arguments)
    }
  })

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
  wxCompConfig.created = function () {
    const { created } = $options
    const { $app } = $global
    const $wxComponent = this
    const $wxPage = getWxPage($wxComponent)

    ctx.$app = ctx.$app || $app
    ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
    ctx.$wxComponent = $wxComponent
    ctx.$root = $wxPage ? $wxPage.$page : null
    ctx.$wxRoot = $wxPage

    if (typeof created !== 'function') {
      return
    }

    return created.apply(ctx, arguments)
  }

  // Proxy detached
  wxCompConfig.detached = function () {
    try {
      const { detached } = $options
      if (typeof detached === 'function') {
        return detached.apply(ctx, arguments)
      }
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
