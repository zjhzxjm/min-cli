/// <reference path="../../../../types/index.d.ts" />

declare namespace DefinePlugin {
  export interface Config {}

  export interface Options {
    filter: RegExp
    config: Config
  }
}
