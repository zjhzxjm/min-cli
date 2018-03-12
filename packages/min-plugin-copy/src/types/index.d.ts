/// <reference path="../../../../types/index.d.ts" />

declare namespace PluginCopy {
  export interface Config {}

  export interface Options {
    filter: RegExp
    config: Config
  }
}
