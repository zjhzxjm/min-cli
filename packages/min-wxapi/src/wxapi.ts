import RequestMQ from './request-mq'
import { NO_PROMISE_METHODS } from './const'
import { filterWxApiOptions, isArray, isUndefined } from './util'

const WX_API_CALLBACKS = ['fail', 'success', 'complete']
let Min: any

export namespace WxApi {
  export interface Options {
    promisify?: boolean
    requestfix?: boolean,
    interceptors?: Function[]
    noPromiseAPI?: string[] | {
      [key: string]: boolean
    }
  }
}

export class WxApi {

  options: WxApi.Options = Object.create(null)

  private $wxApi: {
    [key: string]: (...arg) => {}
  } = Object.create(null)

  private _interceptors: {
    [key: string]: {
      before?: (options, api) => {}
      success?: (res, options, api) => {},
      fail?: (err, options, api) => {}
      complete?: (res, options, api) => {}
    }
  } = {}

  constructor (options: WxApi.Options = {}) {
    this.options = Object.assign({}, {
      promisify: true,
      requestfix: true
    }, options)

    this._initIntercept()
    this._initApi()
  }

  static install (_Min: any) {
    if (Min && Min === _Min) {
      console.error('[MinWxapi] already installed.')
      return
    }
    Min = _Min

    Object.defineProperties(Min.prototype, {
      $wxApi: {
        get () {
          if (this.$app) {
            return this.$app.$wxApi
          }
        }
      }
    })
  }

  intercept (api: string, provider: any) {
    this._interceptors[api] = provider
  }

  private _initIntercept () {
    const { interceptors } = this.options

    if (isArray(interceptors)) {
      interceptors.forEach(interceptor => {
        interceptor(this)
      })
    }
  }

  private _initApi () {
    const self = this
    const { $wxApi } = this
    const { noPromiseAPI, promisify } = this.options
    const noPromiseMethods = Object.assign({}, NO_PROMISE_METHODS)

    if (noPromiseAPI) {
      if (Array.isArray(noPromiseAPI)) {
        noPromiseAPI.forEach(v => noPromiseMethods[v] = true)
      }
      else {
        for (let k in noPromiseAPI) {
          noPromiseMethods[k] = noPromiseAPI[k]
        }
      }
    }

    let canPromise = false
    let hasOnPrefix = false
    let hasSyncSuffix = false

    Object.keys(wx).forEach((wxApiName) => {
      canPromise = !noPromiseMethods[wxApiName]
      hasOnPrefix = wxApiName.substr(0, 2) !== 'on'
      hasSyncSuffix = !(/\w+Sync$/.test(wxApiName))

      if (canPromise && hasOnPrefix && hasSyncSuffix) {
        Object.defineProperty($wxApi, wxApiName, {
          get () {
            return (wxApiOptions: any = {}) => {

              wxApiOptions = filterWxApiOptions(wxApiName, wxApiOptions)

              // Get An interceptor
              let intercept = self._interceptors[wxApiName]

              // Intercept the config
              if (intercept && intercept.before) {
                let result = intercept.before.call(self, wxApiOptions, wxApiName)
                if (result === false) {
                  if (promisify) {
                    return Promise.reject('aborted by interceptor')
                  }
                  else {
                    wxApiOptions.fail && wxApiOptions.fail('aborted by interceptor')
                    return
                  }
                }
                wxApiOptions = result
              }

              if (typeof wxApiOptions === 'string') {
                return wx[wxApiName](wxApiOptions)
              }

              if (promisify) {
                return self._promisifyApi(wxApiName, wxApiOptions)
              }
              else {
                return self._interceptApi(wxApiName, wxApiOptions)
              }
            }
          }
        })
      }
      else {
        Object.defineProperty($wxApi, wxApiName, {
          get () {
            return (...args) => wx[wxApiName].apply(wx, args)
          }
        })
      }
    })
  }

  private _promisifyApi (wxApiName, wxApiOptions) {
    const { requestfix } = this.options
    let task
    // Create a Promise
    const p = new Promise((resolve, reject) => {
      // Intercepts data from the callback function.
      WX_API_CALLBACKS.forEach((k) => {
        wxApiOptions[k] = (result) => {

          // Get An interceptor
          let intercept = this._interceptors[wxApiName]

          if (intercept && intercept[k]) {
            // Call and get the return value of the interceptor.
            result = intercept[k].call(this, result, wxApiOptions, wxApiName)
          }

          if (k === 'success') {
            resolve(result)
          }
          else if (k === 'fail') {
            reject(result)
          }
        }
      })

      // The queue request
      if (requestfix && wxApiName === 'request') {
        RequestMQ.request(wxApiOptions)
      }
      // Using native api
      else {
        task = wx[wxApiName](wxApiOptions)
      }
    })

    if (wxApiName === 'uploadFile' || wxApiName === 'downloadFile') {
      p.progress = (cb) => {
        task.onProgressUpdate(cb)
        return p
      }
      p.abort = (cb) => {
        cb && cb()
        task.abort()
        return p
      }
    }
    return p
  }

  private _interceptApi (wxApiName, wxApiOptions) {
    const { requestfix } = this.options

    // Intercepts data from the callback function.
    WX_API_CALLBACKS.forEach((k) => {
      // Get the original callback function.
      // For example: success/fail/complete
      let oriCallBack = wxApiOptions[k]

      // Rewrite the callback function.
      wxApiOptions[k] = (result) => {

        // Get An interceptor
        let intercept = this._interceptors[wxApiName]

        if (intercept && intercept[k]) {
          // Call and get the return value of the interceptor.
          result = intercept[k].call(this, result, wxApiOptions, wxApiName)
        }

        // Call the original callback function.
        oriCallBack && oriCallBack.call(this, result)
      }
    })

    // The queue request
    if (requestfix && wxApiName === 'request') {
      RequestMQ.request(wxApiOptions)
    }

    // Using native api
    else {
      return wx[wxApiName](wxApiOptions)
    }
  }

}
