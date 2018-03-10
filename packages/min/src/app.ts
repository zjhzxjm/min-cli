import mixin from './mixin'
import { isFunction, mixMethods } from './util'

export {
  createApp
}

function createApp (appConfig) {

  // Mix the methods in appConfig to the outermost layer.
  appConfig = mixMethods(appConfig)

  // Mixed data and methods.
  appConfig = mixin(appConfig)

  if (App && typeof App === 'function') {
    // Call WeChat mini program native App.
    return App(appConfig)
  }

  else {
    // TODO
  }
}
