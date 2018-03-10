
declare module 'autoprefixer' {
  interface Autoprefixer {
    (config: MinPluginAutoprefixer.Config): any
  }
  const autoprefixer: Autoprefixer
  export = autoprefixer
}

declare namespace MinPluginAutoprefixer {
  export interface Config {
    browsers: string[]
  }

  export interface Options {
    filter: RegExp
    config: Config
  }
}
