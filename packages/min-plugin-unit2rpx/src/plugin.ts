export interface Plugin {
  apply (pluginOptions: Plugin.Options): Promise<string>
}
export namespace Plugin {
  export interface Options {
    src: string,
    code: string,
    output (action: string, msg: string): void
    done (options: Options): void
  }
}

class PluginHelper {
  static loadedPlugins: Plugin[] = []
  constructor (plugins: Plugin[], options: Plugin.Options) {
    this.applyPlugin(0, options)
  }
  async applyPlugin (index: number, options: Plugin.Options) {
    let plugin = PluginHelper.loadedPlugins[index]
    let { done } = options

    if (!plugin) {
      done(options)
    }
    else {
      let code = await plugin.apply(options)
      let nextOptions = Object.assign({}, options, {
        code
      })
      await this.applyPlugin(index + 1, nextOptions)
    }
  }
}
