/// <reference path="../../../../types/index.d.ts" />

declare namespace ImageminPlugin {
  export interface Config {
    jpg: any,
    png: any
  }

  export interface Options {
    filter: RegExp
    config: Config
  }
}
