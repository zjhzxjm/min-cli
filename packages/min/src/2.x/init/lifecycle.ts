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

  // Proxy onLoad
  wxPageConfig.onLoad = function () {
    const { onLoad } = $options
    const { $app } = $global
    const $wxPage = this

    ctx.$app = ctx.$app || $app
    ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
    ctx.$wxPage = $wxPage
    $wxPage.$page = ctx

    createRenderWatcher(ctx, dirtyData => {
      $wxPage.setData(dirtyData)
    })

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

    createRenderWatcher(ctx, dirtyData => {
      $wxComponent.setData(dirtyData)
    })

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

function createRenderWatcher (ctx: Weapp.Context, watchDirtyFn: (dirtyData: Object) => void) {
  let { $options } = ctx
  let cached = {}

  function deleteDirty (value, exp) {
    // @ts-ignore
    let { __ob__ } = value || {}

    if (__ob__) {
      delete __ob__.renderDirty
    }

    if (isPlainObject(value)) {
      Object.keys(value).forEach(key => deleteDirty(value[key], `${exp}[${key}]`))
    }
    else if (Array.isArray(value)) {
      value.forEach((item, index) => deleteDirty(item, `${exp}[${index}]`))
    }
    else {
      cached[exp] = value
    }
  }

  function getDirtyData (value, exp) {
    let dirtyData = {}
    if (isPlainObject(value) || Array.isArray(value)) {
      // @ts-ignore
      let { __ob__ } = value

      if (__ob__.renderDirty) { // 数据结构已改变
        dirtyData[exp] = value

        let regexp = new RegExp('^' + exp + '(\\.|\\[)')
        Object.keys(cached).forEach(key => {
          if (key === exp || regexp.test(key)) {
            delete cached[key]
          }
        })
        deleteDirty(value, exp)
      }
      else {
        let dirtyDatas = []
        if (isPlainObject(value)) {
          dirtyDatas = Object.keys(value).map(key => {
            return getDirtyData(value[key], `${exp}[${key}]`)
          })
        }
        else {
          dirtyDatas = value.map((item, index) => {
            return getDirtyData(item, `${exp}[${index}]`)
          })
        }

        dirtyDatas.forEach(data => Object.assign(dirtyData, data))
      }
    }
    else if (value === undefined || value !== cached[exp]) { // 简单数据类型
      dirtyData[exp] = value
      cached[exp] = value
    }
    return dirtyData
  }

  let renderWatcher = new Watcher(ctx, () => {
    let dirtyData = {}
    let { _renderDatas = [] } = $options

    _renderDatas
    .map(exp => {
      let getter = parsePath(exp) || noop
      let value = getter.call(ctx, ctx)
      return getDirtyData(value, exp)
    })
    .forEach(data => Object.assign(dirtyData, data))

    if (Object.keys(dirtyData).length > 0) {
      console.group('setData')
      console.log(JSON.parse(JSON.stringify(dirtyData)))
      console.groupEnd()

      console.group('dirtyCached')
      console.log(JSON.parse(JSON.stringify(cached)))
      console.groupEnd()
      watchDirtyFn(dirtyData)
    }
  }, noop, null, true)

  return renderWatcher
}
