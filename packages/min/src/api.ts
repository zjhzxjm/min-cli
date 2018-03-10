import * as native from './native'
import RequestMQ from './request-mq'
import { NO_PROMISE_METHODS } from './const'
import { filterWxApiOptions } from './util'

export {
  initApi
}

const WX_API_CALLBACKS = ['fail', 'success', 'complete']

function initApi (min, noPromiseAPI = null) {
  let noPromiseMethods = Object.assign({}, NO_PROMISE_METHODS)
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
  Object.keys(wx).forEach((wxApiName) => {
    let canPromise = !noPromiseMethods[wxApiName]
    let hasOnPrefix = wxApiName.substr(0, 2) !== 'on'
    let hasSyncSuffix = !(/\w+Sync$/.test(wxApiName))

    if (canPromise && hasOnPrefix && hasSyncSuffix) {
      Object.defineProperty(native, wxApiName, {
        get () {
          return (wxApiOptions: any = {}) => {

            // Get An interceptor
            let intercept = min.interceptors[wxApiName]

            if (intercept && intercept.before) {
              let result = intercept.before.call(min, wxApiOptions, wxApiName)
              if (result === false) {
                if (min.options.promisify) {
                  return Promise.reject('aborted by interceptor')
                }
                else {
                  wxApiOptions.fail && wxApiOptions.fail('aborted by interceptor')
                  return
                }
              }
              wxApiOptions = result
            }

            wxApiOptions = filterWxApiOptions(wxApiName, wxApiOptions)

            if (typeof wxApiOptions === 'string') {
              return wx[wxApiName](wxApiOptions)
            }

            if (min.options.promisify) {
              return promisifyApi (min, wxApiName, wxApiOptions)
            }
            else {
              return interceptApi (min, wxApiName, wxApiOptions)
            }
          }
        }
      })
    }

    else {
      Object.defineProperty(native, wxApiName, {
        get () {
          return (...args) => wx[wxApiName].apply(wx, args)
        }
      })
    }

    min[wxApiName] = native[wxApiName]
  })
}

function promisifyApi (min, wxApiName, wxApiOptions) {
  let task
  // Create a Promise
  const p = new Promise((resolve, reject) => {
    // Intercepts data from the callback function.
    WX_API_CALLBACKS.forEach((k) => {
      wxApiOptions[k] = (result) => {

        // Get An interceptor
        let intercept = min.interceptors[wxApiName]

        if (intercept && intercept[k]) {
          // Call and get the return value of the interceptor.
          result = intercept[k].call(min, result, wxApiOptions, wxApiName)
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
    if (min.options.requestfix && wxApiName === 'request') {
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

function interceptApi (min, wxApiName, wxApiOptions) {
  // Intercepts data from the callback function.
  WX_API_CALLBACKS.forEach((k) => {
    // Get the original callback function.
    // For example: success/fail/complete
    let oriCallBack = wxApiOptions[k]

    // Rewrite the callback function.
    wxApiOptions[k] = (result) => {

      // Get An interceptor
      let intercept = min.interceptors[wxApiName]

      if (intercept && intercept[k]) {
        // Call and get the return value of the interceptor.
        result = intercept[k].call(min, result, wxApiOptions, wxApiName)
      }

      // Call the original callback function.
      oriCallBack && oriCallBack.call(min, result)
    }
  })

  // The queue request
  if (min.options.requestfix && wxApiName === 'request') {
    RequestMQ.request(wxApiOptions)
  }

  // Using native api
  else {
    return wx[wxApiName](wxApiOptions)
  }
}
