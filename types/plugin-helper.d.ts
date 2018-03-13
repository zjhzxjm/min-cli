

declare namespace PluginHelper {
  export interface Plugin {
    useway: string
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
