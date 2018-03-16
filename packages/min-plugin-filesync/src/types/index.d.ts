declare namespace FilesyncPlugin {
  export interface Config {
    cwd: string
    from: string | string[]
    to: string
    filter: RegExp
    validate (filename: string): boolean
    force: boolean
    ignore: string | string[]
    [key: string]: any
  }

  // export interface KeyValue {
  //   [key: string]: Config | any
  // }

  export interface Options extends Config {

  }
}
