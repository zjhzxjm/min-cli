
export namespace CompilerHelper {
  export interface Options {
    cwd: string
    filename: string
    extend: {
      ast?: any
      content?: string
    }
    config: any
  }
}
