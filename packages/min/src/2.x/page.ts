import { observe, defineReactive } from './observer'
import Watcher from './observer/watcher'
import MinBase from './base'
import { nextTick, warn, mergeOptions } from './util'
import { initPageLifecycle } from './init'

class MinPage extends MinBase implements Page.Context {

  static options = Object.create(null)
  static nextTick = nextTick
  static util = { warn, mergeOptions, defineReactive }

  $wxPage: any = null

  constructor (options: Page.Options) {
    super(options)

    if (process.env.NODE_ENV !== 'production' && !(this instanceof MinPage)) {
      warn('MinPage is a constructor and should be called with the `new` keyword')
    }
    this.$init()
  }

  static mixin (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }

  protected $init () {
    super.$init()
    initPageLifecycle(this, this.$wxConfig)
  }
}

export default function page (options: Page.Options) {
  let page = new MinPage(options)
  return Page(page.$wxConfig)
}
