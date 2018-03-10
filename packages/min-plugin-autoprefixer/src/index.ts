import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import { Plugin } from './plugin'
import { DEFAULTS } from './const'

export default class MinPluginAutoprefixer implements Plugin {
  constructor (public options: MinPluginAutoprefixer.Options) {
    this.options = Object.assign({}, DEFAULTS, this.options)
  }

  async apply (pluginOptions: Plugin.Options): Promise<string> {
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
