import * as _ from 'lodash'
import { PluginHelper } from '@mindev/min-core'

export const DEFAULTS: SdkPlugin.Options = {
  config: {},
  test: new RegExp('\.(JS)$'),
  filter (options: PluginHelper.Options) {
    return true
  }
}

export namespace SdkPlugin {
  export interface Config {}

  export interface Options {
    config: Config
    test: RegExp
    filter (options: PluginHelper.Options): boolean
  }
}

export default class SdkPlugin extends PluginHelper.SdkPlugin {

  constructor (public options: SdkPlugin.Options) {
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

    try {
      // TODO

      _.merge(options, { extend: { content } })
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }
}
