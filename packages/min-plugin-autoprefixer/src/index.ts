import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import { DEFAULTS } from './const'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import Options = PluginAutoprefixer.Options

export default class PluginAutoprefixer implements Plugin {
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
      output('变更', src)

      let processor = postcss([
        autoprefixer(config)
      ])
      return processor.process(code).then(result => result.css)
    }
  }
}
