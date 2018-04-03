import * as postcss from 'postcss'
import unit2Rpx from './unit2rpx'
import { util, PluginHelper } from '@mindev/min-core'

const DEFAULTS: Unit2RpxPlugin.Options = {
  config: {
    px: 1,
    rem: 100
  },
  filter: new RegExp('\.(wxss)$'),
  validate (options: PluginHelper.Options) {
    return true
  }
}

export namespace Unit2RpxPlugin {
  export interface Config {
    px: number,
    rem: number
  }

  export interface Options {
    config: Config
    filter: RegExp
    validate (options: PluginHelper.Options): boolean
  }
}

export default class Unit2RpxPlugin extends PluginHelper.TextPlugin {

  constructor (public options: Unit2RpxPlugin.Options) {
    super('Unit2RpxPlugin')

    this.options = {
      ...DEFAULTS,
      ...this.options
    }
  }

  async apply (options: PluginHelper.Options): Promise<PluginHelper.Options> {
    let { filter, validate, config } = this.options
    let { filename, extend = {} } = options
    let { content = '' } = extend
    let p = Promise.resolve(options)

    if (util.isRegExp(filter) && !filter.test(filename)) {
      return p
    }

    if (util.isFunction(validate) && !validate(options)) {
      return p
    }

    if (!content) {
      return p
    }

    // output('变更', filename)

    try {
      content = await unit2Rpx(content, config)

      util.merge(options, { extend: { content } })
    }
    catch (err) {
      p = Promise.reject(err)
    }
    return p
  }
}
