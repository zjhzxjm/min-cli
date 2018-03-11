declare module 'imagemin' {
  function imagemin (input: string[], output: string | null, options: object): Promise<{
    data: Buffer,
    path: String
  }[]>
  export = imagemin
}

declare module 'imagemin-mozjpeg' {
  function mozjpeg (options: object): Promise<Buffer>
  export = mozjpeg
}

declare module 'imagemin-pngquant' {
  function pngquant (options: object): Promise<Buffer>
  export = pngquant
}
