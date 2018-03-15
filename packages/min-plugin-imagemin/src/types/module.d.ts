declare module 'imagemin' {
  interface Imagemin {
    (input: string[], output: string | null, options: object): Promise<{
      data: Buffer,
      path: String
    }[]>
  }
  const imagemin: Imagemin
  export = imagemin
}

declare module 'imagemin-mozjpeg' {
  interface Mozjpeg {
    (options: object): Promise<Buffer>
  }
  const mozjpeg: Mozjpeg
  export = mozjpeg
}

declare module 'imagemin-pngquant' {
  interface Pngquant {
    (options: object): Promise<Buffer>
  }
  const pngquant: Pngquant
  export = pngquant
}

declare module 'imagemin-webp' {
  interface Webp {
    (options: object): Promise<Buffer>
  }
  const webp: Webp
  export = webp
}

declare module 'imagemin-gifsicle' {
  interface Gifsicle {
    (options: object): Promise<Buffer>
  }
  const gifsicle: Gifsicle
  export = gifsicle
}
