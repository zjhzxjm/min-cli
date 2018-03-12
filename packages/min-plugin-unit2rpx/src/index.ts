import * as postcss from 'postcss'
import unit2Rpx from './unit2rpx'
import { DEFAULTS } from './const'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import PluginUseway = PluginHelper.Useway
import Options = PluginUnit2Rpx.Options

export default class PluginUnit2Rpx implements Plugin {
  useway = PluginUseway.any

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
