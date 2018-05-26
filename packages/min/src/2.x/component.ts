import Min from './min'
import { warn } from './util'
import { initProps, initComponentLifecycle } from './init'

class MinComponent extends Min implements Component.Context {

  $root?: Page.Context = null// in Current Page
  $wxRoot?: any = null // in Current Page
  $wxComponent?: any = null

  $properties: Weapp.Properties = Object.create(null)
  _properties: Weapp.Properties = Object.create(null)
  readonly _isComponent: boolean = true

  constructor (options: Component.Options, exts?: Weapp.Extends) {
    super(options, exts)

    if (process.env.NODE_ENV !== 'production' && !(this instanceof MinComponent)) {
      warn('MinComponent is a constructor and should be called with the `new` keyword')
    }

    this.$init()
  }

  protected $init () {
    initProps(this, this.$wxConfig)
    super.$init()
    initComponentLifecycle(this, this.$wxConfig)
    this._initPropDef()
  }

  private _initPropDef () {
    const propsDef: any = {}
    propsDef.get = function () {
      return this._properties
    }

    if (process.env.NODE_ENV !== 'production') {
      propsDef.set = function () {
        warn(`$properties is readonly.`, this)
      }
    }
    Object.defineProperty(this, '$properties', propsDef)
  }
}

export default function createComponent (options: Component.Options, exts?: Weapp.Extends) {
  let com = new MinComponent(options, exts)
  return Component(com.$wxConfig)
}

// 1. 将 props => {key: value} 得到类似 data 的对象
// 2. 将 原有的 props => Config.props
// 3. 同 data 一样 Observe(props) => _props
// 4. 劫持 observe ，将变更的值 同步到 this._props
// 5. 重载 生命周期，watcher 每个 props，并 setData 更新视图
