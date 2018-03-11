/// <reference path="../../../../types/index.d.ts" />

declare namespace PluginAutoprefixer {
  export interface Config {
    browsers: string[]
  }

  export interface Options {
    filter: RegExp
    config: Config
  }
}
