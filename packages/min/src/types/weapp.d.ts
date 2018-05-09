
declare namespace Weapp {

  /**
   * The context of a component or page.
   *
   * @interface Context
   */
  interface Context {
    $app?: App.Context
    $wxApp?: any
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
    $wxApp: any
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
    globalData?: GlobalData
    store?: Store
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
    $wxPage?: any
    $wxConfig: Config
    $options: Options
    $store?: Store
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
    $root?: Page.Context // in Current Page
    $wxRoot?: any // in Current Page
    $wxComponent?: any
    $wxConfig: Config
    $options: Options

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

/**
 * Min plugin
 *
 * @interface Plugin
 */
interface Plugin {
  new ()
  install: Function
}
