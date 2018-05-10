import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
// import { eventsMixin } from './events'
// import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function MVVM (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof MVVM)
  ) {
    warn('MVVM is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(MVVM)
stateMixin(MVVM)
// eventsMixin(MVVM)
// lifecycleMixin(MVVM)
renderMixin(MVVM)

export default MVVM
