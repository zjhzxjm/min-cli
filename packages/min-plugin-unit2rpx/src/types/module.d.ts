declare namespace MinPluginUnit2Rpx {
  export interface Config {
    px: number,
    rem: number
  }

  export interface Options {
    filter: RegExp
    config: Config
  }
}
