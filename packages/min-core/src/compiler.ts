
export namespace CompilerHelper {
  export interface Options {
    cwd: string // Current working directory
    filename: string // Physical file path
    extend?: { // Expansion option
      ast?: any
      code?: string
      map?: any
      imports?: string[]
    }
    config: any // User-defined configuration of the compiler.
  }

  export interface Result extends Options {

  }

  export interface Compiler {
    (options: Options): Promise<Result>
    sync? (options: Options): Result
  }
}
