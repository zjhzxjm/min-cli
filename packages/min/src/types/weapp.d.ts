
declare namespace Weapp {

  /**
   * The context of a component or page.
   *
   * @interface Context
   */
  interface Context {
    $app?: App.Context
    $wx?: any
    $wxConfig: Config

    $data: Data
    $globalData: App.GlobalData
    $options: Options

    $watch: Function
    $nextTick: Function

    _data?: Data
    _computedWatchers?: {
      [key: string]: any
    }
    _watcher?: any
    _watchers?: {
      [key: string]: any
    }
    _nextTicks?: Function[]
    _isWeapp?: Boolean
    _isComponent?: Boolean
  }

  /**
   * Native constructor configuration.
   *
   * @interface Config
   */
  interface Config {
    properties?: Properties
    data?: Data,
    methods?: Methods
    [key: string]: Function | any
  }

  /**
   * Min constructor option.
   *
   * @interface Options
   */
  interface Options {
    properties?: Properties
    data?: { [key: string]: any } | Function
    methods?: Methods
    computed: Computed
    watch: Watch

    _renderExps?: string[]
  }

  interface Extends {
    init?: boolean,
    renderExps?: string[]
  }

  /**
   * Properties of components
   *
   * @interface Properties
   */
  interface Properties {
    [key: string]: any
  }

  /**
   * Component or page data.
   *
   * @interface Data
   */
  interface Data {
    [key: string]: any
  }

  /**
   * The method of a component or page.
   *
   * @interface Methods
   */
  interface Methods {
    [key: string]: Function
  }

  /**
   * The computational properties of a component or page.
   *
   * @interface Computed
   */
  interface Computed {
    [key: string]: Function
  }

  /**
   * The watch of a component or page.
   *
   * @interface Watch
   */
  interface Watch {
    [key: string]: WatchCallback
  }

  type WatchCallback = string | Function | Function[] | WatchHandler

  interface WatchHandler extends Object {
    handler: Function
    deep: boolean
    immediate: boolean
  }
}

declare namespace App {

  /**
   * Context of App
   *
   * @interface Context
   */
  interface Context {
    $wx: any
    $options: Options
    $globalData: GlobalData
    $store?: Store

    _globalData?: GlobalData
  }

  /**
   * Options for the Min constructor.
   *
   * @interface Options
   * @extends {Lifecycle}
   */
  interface Options extends Lifecycle {
    properties?: Weapp.Properties // TODO: 兼容 ./init/methods/initMethods 方法能复用 Weapp 和 App
    methods?: Weapp.Methods
    globalData?: GlobalData
    store?: Store
    wxApi?: WxApi
  }

  /**
   * Native constructor configuration.
   *
   * @interface Config
   * @extends {Lifecycle}
   */
  interface Config extends Lifecycle {
    globalData?: GlobalData
  }

  /**
   * Life cycle hook
   *
   * @interface Lifecycle
   */
  interface Lifecycle {
    onLaunch?: Function
    onShow?: Function
    onHide?: Function
    onError?: Function
    onPageNotFound?: Function
  }

  /**
   * Global data
   *
   * @interface GlobalData
   */
  interface GlobalData {
    [key: string]: any
  }
}

declare namespace Page {

  /**
   * Context of Page
   *
   * @interface Context
   * @extends {Weapp.Context}
   */
  interface Context extends Weapp.Context {

  }

  /**
   * Native constructor configuration.
   *
   * @interface Config
   * @extends {Lifecycle}
   * @extends {Weapp.Config}
   */
  interface Config extends Lifecycle, Weapp.Config {}

  /**
   * Min constructor option.
   *
   * @interface Options
   * @extends {Lifecycle}
   * @extends {Weapp.Options}
   */
  interface Options extends Lifecycle, Weapp.Options {
    store?: Store
  }

  /**
   * Life cycle hook
   *
   * @interface Lifecycle
   */
  interface Lifecycle {
    onLoad?: Function
    onReady?: Function
    onShow?: Function
    onHide?: Function
    onUnload?: Function
    onPullDownRefresh?: Function
    onReachBottom?: Function
    onShareAppMessage?: Function
    onPageScroll?: Function
    onTabItemTap?: Function
  }
}

declare namespace Component {

  /**
   * Context of Component
   *
   * @interface Context
   * @extends {Weapp.Context}
   */
  interface Context extends Weapp.Context {
    $page?: Page.Context // in Current Page

    $properties: Weapp.Properties
    _properties: Weapp.Properties
  }

  /**
   * Native constructor configuration.
   *
   * @interface Config
   * @extends {Lifecycle}
   * @extends {Weapp.Config}
   */
  interface Config extends Lifecycle, Weapp.Config {}

  /**
   * Min constructor option.
   *
   * @interface Options
   * @extends {Lifecycle}
   * @extends {Weapp.Options}
   */
  interface Options extends Lifecycle, Weapp.Options {}

  /**
   * Life cycle hook
   *
   * @interface Lifecycle
   */
  interface Lifecycle {
    created?: Function
    attached?: Function
    ready?: Function
    moved?: Function
    detached?: Function
  }
}

/**
 * Minx store
 *
 * @interface Store
 */
interface Store {
  dispatch: Function;
  commit: Function;
  getters: any;
  _getters: any;
  _actions: any;
  _mutations: any;
  _modules: any;
  _watch: any;
  _vitrualDom: any;
}

interface WxApi {
  $wxApi: {
    [key: string]: (...arg) => {}
  }
}

/**
 * Min plugin
 *
 * @interface Plugin
 */
interface Plugin {
  new ()
  install: Function
}
