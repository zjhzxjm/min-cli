declare namespace FilesyncPlugin {
  export interface Config {
    cwd: string
    from: string | string[]
    to: string
    test: RegExp
    validate (filename: string): boolean
    force: boolean
    ignore: string | string[]
  }

  // export interface KeyValue {
  //   [key: string]: Config | any
  // }

  export interface Options extends Config, Array<Config> {

  }
}
