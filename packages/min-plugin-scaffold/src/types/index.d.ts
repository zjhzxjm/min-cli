/// <reference path="../../../../types/index.d.ts" />

declare namespace PluginScaffold {
  export interface Config {}

  export interface Options {
    filter: RegExp
    config: Config
  }
}
