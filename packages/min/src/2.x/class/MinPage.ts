import Min from './Min'
import { warn } from '../util'

export default class MinPage extends Min implements Page.Context {

  constructor (options: Page.Options, exts?: Weapp.Extends) {
    super(options, exts)

    if (process.env.NODE_ENV !== 'production' && !(this instanceof MinPage)) {
      warn('MinPage is a constructor and should be called with the `new` keyword')
    }
  }

  $init () {
    if (this._isInit) return

    super.$init()
    this._initData()
  }

  private _initData () {
    let { __code__ } = this._data

    if (__code__) {
      this.$wx.setData({
        __code__
      })
    }
  }
}
