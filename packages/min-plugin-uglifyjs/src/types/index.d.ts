/// <reference path="../../../../types/index.d.ts" />

declare namespace PluginUglifyjs {
  export interface Config {
    compress: {
      warnings: boolean
    },
    fromString: boolean
  }

  export interface Options {
    filter: RegExp
    config: Config
  }
}
