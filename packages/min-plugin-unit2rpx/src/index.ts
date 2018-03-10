import * as postcss from 'postcss'
import unit2Rpx from './unit2rpx'
import { Plugin } from './plugin'
import { DEFAULTS } from './const'

export default class MinPluginUnit2Rpx implements Plugin {
  constructor (public options: MinPluginUnit2Rpx.Options) {
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
      return await unit2Rpx(code, config)
    }
  }
}
