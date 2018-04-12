import Watcher from '../observer/watcher'
import $global from '../global'
import { noop, APP_EVENT, PAGE_EVENT, COMPONENT_EVENT } from '../util'

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

  function updateDirtyData (ctx: Page.Context) {
    let { $wxPage, $dirty } = ctx
    let dirtyData = {}

    if (!$dirty.length) {
      return
    }

    $dirty.concat(Object.keys(ctx._computedWatchers || {})).forEach(key => {
      dirtyData[key] = ctx[key]
    })
    $dirty.length = 0

    $wxPage.setData(dirtyData)
  }

  function createRenderWatcher (ctx: Page.Context) {
    let init = false
    new Watcher(ctx, function () {
      if (!init) {
        for (let k in ctx._data) {
          // initialize getter dep
          /* tslint:disable */
          ctx._data[k]
        }
        // BUG 导致二次数据赋值无法触发watcher
        init = false
      }

      updateDirtyData(ctx)
    }, noop, null, true)
  }

  // Proxy onLoad
  wxPageConfig.onLoad = function () {
    const { onLoad } = $options
    const { $app } = $global
    const $wxPage = this

    ctx.$app = ctx.$app || $app
    ctx.$wxApp = ctx.$wxApp || ($app ? $app.$wxApp : undefined)
    ctx.$wxPage = $wxPage
    $wxPage.$page = ctx

    createRenderWatcher(ctx)

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

  function updateDirtyData (ctx: Component.Context) {
    let { $wxComponent, $dirty } = ctx
    let dirtyData = {}

    if (!$dirty.length) {
      return
    }

    $dirty.concat(Object.keys(ctx._computedWatchers || {})).forEach(key => {
      dirtyData[key] = ctx[key]
    })
    $dirty.length = 0

    $wxComponent.setData(dirtyData)
  }

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

  function createRenderWatcher (ctx: Component.Context) {
    let init = false
    new Watcher(ctx, function () {
      if (!init) {
        for (let k in ctx._data) {
          /* tslint:disable */
          ctx._data[k] // initialize getter dep
        }
        for (let k in ctx._properties) {
          /* tslint:disable */
          ctx._properties[k] // initialize getter dep
        }
        // BUG 导致二次数据赋值无法触发watcher
        init = false
      }

      updateDirtyData(ctx)
    }, noop, null, true)
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

    createRenderWatcher(ctx)

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
