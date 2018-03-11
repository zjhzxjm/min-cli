/// <reference path="../../../../types/index.d.ts" />

declare namespace PluginFilemin {
  export interface Config {}

  export interface Options {
    filter: RegExp
    config: Config
  }
}
