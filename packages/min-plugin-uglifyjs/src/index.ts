import uglify from 'uglify-js'
import { DEFAULTS } from './const'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import PluginUseWay = PluginHelper.UseWay
import Options = PluginUglifyjs.Options

export default class PluginUglifyjs implements Plugin {
  useway = PluginUseWay.any

  constructor (public options: Options) {
    this.options = { ...DEFAULTS, ...this.options }
  }

  async apply (pluginOptions: PluginOptions): Promise<string> {
    let { filter, config } = this.options
    let { filename, content, output } = pluginOptions

    if (!filter.test(filename)) {
      return Promise.resolve(content)
    }
    else {
      output('压缩', filename)

      let result = uglify.minify(content, config)

      return Promise.resolve(result.code)
    }
  }
}
