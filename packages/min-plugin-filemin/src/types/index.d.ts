/// <reference path="../../../../types/index.d.ts" />

declare namespace FileminPlugin {
  export interface Config {}

  export interface Options {
    filter: RegExp
    config: Config
  }
}
