import * as postcss from 'postcss'
import unit2Rpx from './unit2rpx'
import { DEFAULTS } from './const'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import Options = Unit2RpxPlugin.Options

export default class Unit2RpxPlugin implements Plugin {
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
      return await unit2Rpx(content, config)
    }
  }
}
