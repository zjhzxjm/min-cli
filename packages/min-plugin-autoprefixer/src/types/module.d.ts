
declare module 'autoprefixer' {
  interface Autoprefixer {
    (config: AutoprefixerPlugin.Config): any
  }
  const autoprefixer: Autoprefixer
  export = autoprefixer
}
