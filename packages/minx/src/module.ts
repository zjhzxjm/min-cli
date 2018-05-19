import { forEachObjValue } from './common/utils'

/**
 * root: { // 当前moudle
 *  state: {}  // 公用state
 *  children: {}  // 当前moudle子modules,内容结构同root
 *  rawModule: { // 当前moudle的内容
 *    state // 公用state
 *    getter
 *    actions
 *    mutations
 *    plugins
 *    ...
 *  }
 * }
 */
export interface RawModule {
  state?: any // 公用state
  getters?: any
  actions?: any
  mutations?: any
  modules?: RawModule
  plugins?: any
}

export class Module {
  state: any
  children: RawModule
  rawModule: RawModule

  constructor (options: RawModule) {
    this.state = options.state || {}
    this.children = Object.create(null)
    this.rawModule = options
  }

  getChild (key: string) {
    return this.children[key]
  }

  /**
   * 以module名作为key存放子module
   * @param {*} key module名，如{ modules: a{...} }的a
   * @param {*} module a的内容
   */
  addChild (key: string, module: Module) {
    this.children[key] = module
  }

  removeChild (key: string) {
    delete this.children[key]
  }

  forEachGetter (fn: Function) {
    this.rawModule.getters && forEachObjValue(this.rawModule.getters, fn)
  }

  forEachMutation (fn: Function) {
    this.rawModule.mutations && forEachObjValue(this.rawModule.mutations, fn)
  }

  forEachAction (fn: Function) {
    this.rawModule.actions && forEachObjValue(this.rawModule.actions, fn)
  }
}

export class ModulePool {
  root: Module

  constructor (options: RawModule) {
    this.root = Object.create(null)
    this.install([], options)
  }

  /**
   * @param {Array} path [路径名]
   * @returns {Object}
   */
  getModuleByPath (path: string[]): Module {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  /**
   * 循环注册module和子module
   * @param {Array} path [module定义的key的数组集合]
   * @param {Object} options [new Stroe时传入的配置信息]
   * @returns {null}
   */
  install (path: string[], options: RawModule): void {
    const module = new Module(options)
    if (path.length === 0) {
      this.root = module
    }
    else {
      // path: ['aa/bb'] parent的path是['aa']，取前面几位
      const parent = this.getModuleByPath(path.slice(0, -1))
      // 添加到父module.children ['bb']
      parent.addChild(path[path.length - 1], module)
    }

    if (options.modules) {
      forEachObjValue(options.modules, (module: Module, key: string) => {
        this.install(path.concat(key), module)
      })
    }
  }

  uninstall (path: string[]) {
    const parent = this.getModuleByPath(path.slice(0, -1))
    const childKey = path[path.length - 1]
    parent.removeChild(childKey)
  }
}
