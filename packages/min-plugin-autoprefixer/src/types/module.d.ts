
declare module 'autoprefixer' {
  interface Autoprefixer {
    (config: PluginAutoprefixer.Config): any
  }
  const autoprefixer: Autoprefixer
  export = autoprefixer
}
