import * as _ from 'lodash'
import * as postcss from 'postcss'
import unit2Rpx from './unit2rpx'
import { PluginHelper } from '@mindev/min-core'

const DEFAULTS: Unit2RpxPlugin.Options = {
  config: {
    px: 1,
    rem: 100
  },
  test: new RegExp('\.(wxss)$'),
  filter (options: PluginHelper.Options) {
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
    test: RegExp
    filter (options: PluginHelper.Options): boolean
  }
}

export default class Unit2RpxPlugin extends PluginHelper.TextPlugin {

  constructor (public options: Unit2RpxPlugin.Options) {
    super()

    this.options = {
      ...DEFAULTS,
      ...this.options
    }
  }

  async apply (options: PluginHelper.Options): Promise<PluginHelper.Options> {
    let { test, filter, config } = this.options
    let { filename, extend = {} } = options
    let { content = '' } = extend
    let p = Promise.resolve(options)

    if (_.isRegExp(test) && !test.test(filename)) {
      return p
    }

    if (_.isFunction(filter) && !filter(options)) {
      return p
    }

    if (!content) {
      return p
    }

    // output('变更', filename)

    try {
      content = await unit2Rpx(content, config)

      _.merge(options, { extend: { content } })
    }
    catch (err) {
      p = Promise.reject(err)
    }
    return p
  }
}
