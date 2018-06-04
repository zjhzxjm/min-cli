import Base from './Base'
import { warn, mergeOptions } from '../util'
import { initGlobalData } from '../init/global-data'

export default class MinApp extends Base implements App.Context {
  $wx: any = null
  $wxConfig: App.Config = {}
  $options: App.Options = null

  $globalData: App.GlobalData = Object.create(null)
  _globalData: App.GlobalData = Object.create(null)

  $store?: Store
  $wxApi?: {
    [key: string]: (...arg) => {}
  }

  constructor (options: App.Options = {}) {
    super()

    this.$options = mergeOptions({}, options, this) as App.Options
    this._init()
    this._mount()
  }

  private _init () {
    initGlobalData(this)
  }

  private _mount () {
    const { store, wxApi } = this.$options

    if (store) {
      this.$store = store
    }

    if (wxApi) {
      this.$wxApi = wxApi.$wxApi
    }
  }
}
