/// <reference path="../../../../types/index.d.ts" />

declare namespace PluginUnit2Rpx {
  export interface Config {
    px: number,
    rem: number
  }

  export interface Options {
    filter: RegExp
    config: Config
  }
}
