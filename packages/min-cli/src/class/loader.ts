import Plugin = PluginHelper.Plugin
import Options = PluginHelper.Options

export class PluginHelper {
  static loadedPlugins: Plugin[] = []
  constructor (plugins: Plugin[], options: Options) {
    this.applyPlugin(0, options)
  }
  async applyPlugin (index: number, options: Options) {
    let plugin = PluginHelper.loadedPlugins[index]
    let { done } = options

    if (!plugin) {
      done(options)
    } else {
      let code = await plugin.apply(options)
      let nextOptions = Object.assign({}, options, {
        code
      })
      await this.applyPlugin(index + 1, nextOptions)
    }
  }
}
