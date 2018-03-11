import { pd } from 'pretty-data'
import { DEFAULTS } from './const'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import Options = PluginFilemin.Options

export default class PluginFilemin implements Plugin {

  constructor (public options: Options) {
    this.options = Object.assign({}, DEFAULTS, this.options)
  }

  async apply (pluginOptions: PluginOptions): Promise<string> {
    let { filter, config } = this.options
    let { src, code, output } = pluginOptions

    if (!filter.test(src)) {
      return Promise.resolve(code)
    }
    else {
      output('压缩', src)

      if (/\.(wxml|xml)$/.test(src)) {
        code = pd.xmlmin(code)
      }
      else if (/\.wxss$/.test(src)) {
        code = pd.cssmin(code)
      }
      else if (/\.json$/.test(src)) {
        code = pd.jsonmin(code)
      }

      return Promise.resolve(code)
    }
  }
}
