
declare namespace PluginHelper {
  export interface Plugin {
    apply (pluginOptions: PluginHelper.Options): Promise<string>
  }

  export interface Options {
    src: string,
    code: string,
    output (action: string, msg: string): void
    done (options: Options): void
  }
}
