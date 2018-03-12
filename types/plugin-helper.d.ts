

declare namespace PluginHelper {
  export enum Useway {
    'any', 'alone'
  }

  export interface Plugin {
    useway: Useway
    apply (pluginOptions: PluginHelper.Options): Promise<string | Buffer | null> | void
  }

  export interface Options {
    cwd: string
    filename: string
    content: string
    output (action: string, msg: string): void
    done (options: Options): void
  }
}
