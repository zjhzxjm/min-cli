/// <reference path="../../../../types/index.d.ts" />

declare namespace PluginDefine {
  export interface Config {}

  export interface Options {
    filter: RegExp
    config: Config
  }
}
