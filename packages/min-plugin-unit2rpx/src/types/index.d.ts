/// <reference path="../../../../types/index.d.ts" />

declare namespace Unit2RpxPlugin {
  export interface Config {
    px: number,
    rem: number
  }

  export interface Options {
    filter: RegExp
    config: Config
  }
}
