import { RawModule, ModulePool, Module } from './module';
import { forEachObjValue, isPromise, transformToArray } from './common/utils';
import log from './common/log';

let Min: any;

export class BaseStore {
  getters: any;

  _getters: any;

  _actions: any;

  _mutations: any;

  _modules: ModulePool;

  _watch: any;

  _vitrualDom: any;

  dispatch: Function;

  commit: Function;

  constructor (options: RawModule) {
    if (!Min) {
      log.warn('minx has not been installed.Please use \'Min.use(Minx)\' to install it.');
    }

    // this.commit = false // 控制只能由commit、dispatch触发修改state
    this.getters = {};
    this._getters = Object.create(null);
    this._actions = Object.create(null);
    this._mutations = Object.create(null);
    this._modules = new ModulePool(options);
    this._watch = new Min();

    const store = this;
    const root = this._modules.root;

    this.dispatch = (type: string, data?: any) => {
      return this._dispatchHandler(type, data);
    };

    this.commit = (type: string, data?: any) => {
      return this._commitHandler(type, data);
    };

    installModule(store, root.state, root, []);
    setVitrualDom(store, root.state);
  }

  get state () {
    return this._modules.root.state;
  }

  /**
   * 触发action里定义的事件，异步改变state
   * @param {String} type [mutation名称]
   * @param {Object} data [载荷(自定义参数)]
   * @returns {Promise} [返回一个promise，参数是handler函数处理结果]
   */
  private _dispatchHandler (_type: string, _data?: any): Promise<any> {
    const { type, data } = formatter(_type, _data);
    const entry = this._actions[type];
    if (!entry) {
      const tip = `[minx]unknown action type: ${type}`;
      log.error(tip);
      return Promise.reject(tip);
    }
    return entry.length > 1 ? Promise.all(entry.map((handler: any) => handler(data))) : entry[0](data);
  }

  /**
   * 触发mutation里定义的事件，同步改变state
   * @param {String} type [mutation名称]
   * @param {Object} data [载荷(自定义参数)]
   * @returns {null}
   */
  private _commitHandler (_type: string, _data?: any): void {
    const { type, data } = formatter(_type, _data);
    const entry = this._mutations[type];
    if (!entry) {
      log.warn(`[minx error]unknown mutation type: ${type}`);
      return;
    }
    entry.forEach((handler: any) => {
      handler(data);
    });
  }

  /**
   * watch getter's return
   */
  watch (getter: Function, callback?: Function, options?: any) {
    return this._watch.$watch(() => getter(this.state, this.getters), callback, options);
  }

  /**
   * @param {string | array} path
   * @param {moudle} module
   * @param {object} options
   */
  install (path: string | string[], module: Module, options?: any) {
    path = transformToArray(path);
    if (!Array.isArray(path)) {
      log.error(`[minx] path must be a Array：${path}`);
      return;
    }
    // format the module then add to the path
    this._modules.install(path, module);
    // install module's content
    installModule(this, this.state, this._modules.getModuleByPath(path), path);
    // reset store to update getters...
    setVitrualDom(this, this.state);
  }

  uninstall (path: string | string[]) {
    path = transformToArray(path);
    if (!Array.isArray(path)) {
      log.error(`[minx] path must be a Array：${path}`);
      return;
    }

    // delete child module from parent module
    this._modules.uninstall(path);
    // get parent state
    const state = getPartState(this.state, path.slice(0, -1));
    // delete child state from parent state
    Min.del(state, path[path.length - 1]);
    // reset store content
    resetStore(this);
  }
}

function installModule (store: BaseStore, rootState: any, module: Module, path: string[]) {
  if (!module) return;

  // state按照modules的结构存放，子module的state存放在父module的state上
  if (path.length) {
    const parentState = getPartState(rootState, path.slice(0, -1));
    const moduleName = path[path.length - 1];
    Min.set(parentState, moduleName, module.state);
    // parentState[moduleName] = module.state
  }

  const part = makePartModuleCtx(store, path);

  module.forEachMutation((mutation: Function, key: string) => {
    wrapMutation(store, part, mutation, key);
  });

  module.forEachAction((action: Function, key: string) => {
    wrapAction(store, part, action, key);
  });

  module.forEachGetter((getter: Function, key: string) => {
    wrapGetter(store, part, getter, key);
  });

  forEachObjValue(module.children, (childModule: Module, key: string) => {
    installModule(store, rootState, childModule, path.concat(key));
  });
}

function setVitrualDom (store: BaseStore, state: any) {
  const computed: any = {};
  // bind public getters
  forEachObjValue(store._getters, (handler: Function, key: string) => {
    computed[key] = () => handler(store);
    Object.defineProperty(store.getters, key, {
      get: () => store._vitrualDom[key]
    });
  });
  store._vitrualDom = new Min({
    data: {
      $state: state
    },
    computed
  });
}

function resetStore (store: BaseStore) {
  store._getters = Object.create(null);
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  // reset getters、 actions、mutations
  installModule(store, store.state, store._modules.root, []);
  // reset store._vitrualDom
  setVitrualDom(store, store.state);
}

/**
 * 设置module的内容，区分子module和root module
 * 暂不支持自定义namespace，默认用path！！
 */
function makePartModuleCtx (store: BaseStore, path: string[]) {
  // return store._modules.getModuleByPath(path).rawModule
  let part = {
    commit: store.commit,
    dispatch: store.dispatch
  };

  Object.defineProperties(part, {
    getters: {
      get: () => store.getters
    },
    state: {
      get: () => getPartState(store.state, path)
    }
  });

  return part;
}

/**
 * 获取到指定module的state
 * @param {*} state
 * @param {*} path
 */
function getPartState (state: BaseStore, path: string[]) {
  return path.length ? path.reduce((state: any, key) => {
    return state[key];
  }, state) : state;
}

function wrapAction (store: BaseStore, part: any, handler: Function, key: string) {
  const entry = store._actions[key] || (store._actions[key] = []);
  entry.push(function (data: any): Promise<any> {
    // res: promise(actions[key]对应promise)或undefined(actions[key]对应普通函数)
    const { dispatch, commit, getters, state } = part;
    let res = handler.call(store, {
      dispatch,
      commit,
      getters,
      state,
      rootGetters: store.getters,
      rootState: store.state
    }, data);
    return !isPromise(res) ? Promise.resolve(res) : res;
  });
}

function wrapMutation (store: BaseStore, part: any, handler: Function, key: string) {
  const entry = store._mutations[key] || (store._mutations[key] = []);
  entry.push(function (data: any) {
    handler.call(store, part.state, data);
  });
}

function wrapGetter (store: BaseStore, part: any, handler: Function, key: string) {
  if (store._getters[key]) {
    if (process.env.NODE_ENV !== 'production') {
      log.error(`[minx] duplicate getter key: ${key}`);
    }
    return;
  }
  store._getters[key] = function (store: BaseStore) {
    return handler(
      part.state, // 当前子module的state
      part.getters, // 当前子module的getters
      store.state, // rootState
      store.getters // rootGetters
    );
  };
}

function formatter (type: string, data: any) {
  if (typeof type !== 'string') {
    log.warn(`[minx] expects string as the type, but found ${type}`);
  }

  return {
    type,
    data
  };
}

export function install (_Min: any) {
  if (Min && Min === _Min) {
    log.error('[Minx] already installed.');
    return;
  }
  Min = _Min;
  // 注册到beforeCreate生命周期里，混入到每个实例，执行this.$state的代理
  Min.mixin({
    beforeCreate () {
      const opt = this.$options;

      ($page || $component).$app.$options.store

      if (opt.store) {
        this.$store = opt.store;
      } else if (opt.$root && opt.$root.$store) {
        // this.$store = opt.$app.store;
      } else if (opt.$app && opt.$app.$store) {

      }
    }
  });
}
