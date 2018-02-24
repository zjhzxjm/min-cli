import polyfills from './polyfills'
import mixin from './mixin'

export default {
  Page: pageConf => {
    polyfills()
    pageConf = mixin(pageConf)
    /* no-eslint */

    // Call WeChat small program native Page.
    if (Page && typeof Page === 'function') {
      Page(pageConf)
    }
  }
}
