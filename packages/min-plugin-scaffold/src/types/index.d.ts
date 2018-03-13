/// <reference path="../../../../types/index.d.ts" />

declare namespace ScaffoldPlugin {
  export interface Config {}

  export interface Options {
    filter: RegExp
    config: Config
  }
}
