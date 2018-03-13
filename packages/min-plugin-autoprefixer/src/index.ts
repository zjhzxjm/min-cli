import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import { DEFAULTS } from './const'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import Options = AutoprefixerPlugin.Options

export default class AutoprefixerPlugin implements Plugin {
  useway = 'any'

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
      output('变更', filename)

      let processor = postcss([
        autoprefixer(config)
      ])
      return processor.process(content).then(result => result.css)
    }
  }
}
