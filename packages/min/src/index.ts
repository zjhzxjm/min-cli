import { createPage } from './page'
import { createApp } from './app'
import { initApi } from './api'
import { isArray, isUndefined } from './util'
import global from './global'

export namespace Min {
  export interface Options {
    global?: boolean
    promisify?: boolean
    requestfix?: boolean,
    interceptors?: Function[]
    noPromiseAPI?: string[] | {
      [key: string]: boolean
    }
  }
}

export class Min {
  interceptors: {
    [key: string]: any
  } = []

  private _global: boolean

  constructor (public options: Min.Options = {}) {
    initApi(this, options.noPromiseAPI)
    this.init(options)
  }

  get isGlobal () {
    return this._global
  }

  set isGlobal (value) {
    this._global = value

    if (value) {
      global.min = this
    }
    else {
      delete global.min
    }
  }

  init (options: Min.Options = {}) {
    if (!isUndefined(options.global)) {
      this.isGlobal = !!options.global
    }

    if (isArray(options.interceptors)) {
      options.interceptors.forEach(interceptor => {
        interceptor(this)
      })
    }

    this.options = options
  }

  intercept (api: string, provider: any) {
    this.interceptors[api] = provider
  }

  App (appConfig) {
    return createApp(appConfig)
  }

  Page (pageConfig) {
    return createPage(pageConfig)
  }
}

const min = new Min()

export default min
