
declare namespace PluginHelper {
  export interface Plugin {
    apply (pluginOptions: PluginHelper.Options): Promise<string | Buffer | null>
  }

  export interface Options {
    filename: string
    content: string
    output (action: string, msg: string): void
    done (options: Options): void
  }
}
