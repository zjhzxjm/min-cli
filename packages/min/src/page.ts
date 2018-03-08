import mixin from './mixin'
import { isFunction, mixMethods } from './util'

export {
  createPage
}

function createPage (pageConfig) {

  // Mix the methods in pageConfig to the outermost layer.
  pageConfig = mixMethods(pageConfig)

  // Mixed data and methods.
  pageConfig = mixin(pageConfig)

  if (Page && typeof Page === 'function') {
    // Call WeChat mini program native Page.
    return Page(pageConfig)
  }

  else {
    // TODO
  }
}

