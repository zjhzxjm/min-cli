import {
  nextTick
} from '../util/index'

export function renderMixin (MVVM: any) {
  MVVM.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }
}
