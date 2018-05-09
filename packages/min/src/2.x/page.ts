import Min from './min'
import { warn } from './util'
import { initPageLifecycle } from './init'

class MinPage extends Min implements Page.Context {

  $wxPage: any = null
  $store?: Store

  constructor (options: Page.Options) {
    super(options)

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

export default function minPage (options: Page.Options) {
  let page = new MinPage(options)
  return Page(page.$wxConfig)
}
