import Min from '../class/Min'
import MinComponent from '../class/MinComponent'
import MinPage from '../class/MinPage'
import MinApp from '../class/MinApp'
import $global from '../global'
import { handleError } from '../util'
import { noop, APP_EVENT, PAGE_EVENT, COMPONENT_EVENT } from '../util'

export function patchAppLifecycle (wxConfig: App.Config, options: App.Options) {
  const onLaunchLifecycle = function proxyLifecycleHook (...args) {
    const ctx = new MinApp(options)

    $global.$app = ctx
    ctx.$wx = this
    this.$min = ctx

    callHook(ctx, 'onLaunch', args)
  }

  wxConfig.onLaunch = onLaunchLifecycle

  Object.keys(options).forEach(hook => {

    if (
      APP_EVENT.indexOf(hook) === -1 ||
      hook === 'onLaunch'
    ) return

    wxConfig[hook] = proxyLifecycle(hook)
  })
}

export function patchPageLifecycle (wxConfig: Page.Config, options: Page.Options, exts?: Weapp.Extends) {
  const onLoadLifecycle = function proxyLifecycleHook (...args) {
    const ctx = new MinPage(options, exts)

    this.$min = ctx
    ctx.$wx = this
    ctx.$wxConfig = wxConfig
    ctx.$init()

    callHook(ctx, 'onLoad', args)
  }

  const onUnloadLifecycle = function proxyLifecycleHook (...args) {
    let ctx = this.$min as MinPage

    try {
      callHook(ctx, 'onUnload', arguments)
    }
    catch (err) {
      throw err
    }
    finally {
      ctx.teardown()
      this.$min = null
    }
  }

  wxConfig.onLoad = onLoadLifecycle
  wxConfig.onUnload = onUnloadLifecycle

  Object.keys(options).forEach(hook => {

    if (
      PAGE_EVENT.indexOf(hook) === -1 ||
      hook === 'onLoad' ||
      hook === 'onUnload'
    ) return

    wxConfig[hook] = proxyLifecycle(hook)
  })
}

export function patchComponentLifecycle (wxConfig: Component.Config, options: Component.Options, exts?: Weapp.Extends) {

  const createdLifecycle = function proxyLifecycleHook (...args) {
    const ctx = new MinComponent(options, exts)

    this.$min = ctx
    ctx.$wx = this
    ctx.$wxConfig = wxConfig
    ctx.$init()

    callHook(ctx, 'created', args)
  }

  const attachedLifecycle = function proxyLifecycleHook (...args) {
    const ctx = this.$min as MinComponent

    ctx.$initRender()
    callHook(ctx, 'attached', args)
  }

  const readyLifecycle = function proxyLifecycleHook (...args) {
    const ctx = this.$min as MinComponent
    const $wxPage = getWxPage(this.__wxWebviewId__)
    ctx.$page = $wxPage ? $wxPage.$min : null

    callHook(ctx, 'ready', args)
  }

  const detachedLifecycle = function proxyLifecycleHook (...args) {
    let ctx = this.$min as MinComponent

    try {
      callHook(ctx, 'detached', args)
    }
    catch (err) {
      throw err
    }
    finally {
      ctx.teardown()
      ctx.$page = null
      this.$min = null
    }
  }

  wxConfig.created = createdLifecycle
  wxConfig.attached = attachedLifecycle
  wxConfig.ready = readyLifecycle
  wxConfig.detached = detachedLifecycle

  Object.keys(options).forEach(hook => {
    if (
      COMPONENT_EVENT.indexOf(hook) === -1 ||
      ['created', 'attached', 'ready', 'detached'].indexOf(hook) > -1
    ) return

    wxConfig[hook] = proxyLifecycle(hook)
  })
}

export function callHook (ctx: Weapp.Context | App.Context, hook: string, args?: any[] | IArguments) {
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

function getWxPage (wxWebviewId?: number) {
  if (typeof wxWebviewId === 'undefined') return

  const pages = getCurrentPages()

  for (const page of pages) {
    if (page.__wxWebviewId__ === wxWebviewId) {
      return page
    }
  }
  return null
}

function proxyLifecycle (hook) {
  return function proxyLifecycle (...args) {
    callHook(this.$min, hook, args)
  }
}
