import Min from './min'
import { warn } from './util'
import { initPageLifecycle } from './init'

class MinPage extends Min implements Page.Context {

  $wxPage: any = null
  $store?: Store

  constructor (options: Page.Options, exts?: Weapp.Extends) {
    super(options, exts)

    if (process.env.NODE_ENV !== 'production' && !(this instanceof MinPage)) {
      warn('MinPage is a constructor and should be called with the `new` keyword')
    }
    this.$init()
  }

  protected $init () {
    super.$init()
    initPageLifecycle(this, this.$wxConfig)
  }
}

export default function createPage (options: Page.Options, exts?: Weapp.Extends) {
  let page = new MinPage(options, exts)
  return Page(page.$wxConfig)
}
