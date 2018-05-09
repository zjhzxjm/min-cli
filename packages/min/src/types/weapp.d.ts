declare namespace Weapp {

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
   * For WX
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
   * For Min
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

  interface Properties {
    [key: string]: any
  }

  interface Data {
    [key: string]: any
  }

  interface Methods {
    [key: string]: Function
  }

  interface Computed {
    [key: string]: Function
  }

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
  interface Context {
    $wxApp: any
    $options: Options
    $globalData: GlobalData

    _globalData?: GlobalData
  }

  interface Options extends Lifecycle {
    globalData?: GlobalData
  }

  interface Config extends Lifecycle {
    globalData?: GlobalData
  }

  interface Lifecycle {
    onLaunch?: Function
    onShow?: Function
    onHide?: Function
    onError?: Function
    onPageNotFound?: Function
  }

  interface GlobalData {
    [key: string]: any
  }
}

declare namespace Page {
  interface Context extends Weapp.Context {
    $wxPage?: any
    $wxConfig: Config
    $options: Options
  }

  interface Config extends Lifecycle, Weapp.Config {}
  interface Options extends Lifecycle, Weapp.Options {}
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
  interface Context extends Weapp.Context {
    $root?: Page.Context // in Current Page
    $wxRoot?: any // in Current Page
    $wxComponent?: any
    $wxConfig: Config
    $options: Options

    $properties: Weapp.Properties
    _properties: Weapp.Properties
  }

  interface Config extends Lifecycle, Weapp.Config {}
  interface Options extends Lifecycle, Weapp.Options {}
  interface Lifecycle {
    created?: Function
    attached?: Function
    ready?: Function
    moved?: Function
    detached?: Function
  }
}
