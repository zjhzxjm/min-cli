
declare module 'autoprefixer' {
  interface Autoprefixer {
    (config: any): any
  }
  const autoprefixer: Autoprefixer
  export = autoprefixer
}
