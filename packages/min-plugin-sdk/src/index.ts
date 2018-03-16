import * as _ from 'lodash'
import { PluginHelper } from '@mindev/min-core'

export const DEFAULTS: SdkPlugin.Options = {
  config: {},
  filter: new RegExp('\.(js)$'),
  validate (options: PluginHelper.Options) {
    return true
  }
}

export namespace SdkPlugin {
  export interface Config {}

  export interface Options {
    config: Config
    filter: RegExp
    validate (options: PluginHelper.Options): boolean
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
    let { filter, validate, config } = this.options
    let { filename, extend = {} } = options

    let { content = '' } = extend
    let p = Promise.resolve(options)

    if (_.isRegExp(filter) && !filter.test(filename)) {
      return p
    }

    if (_.isFunction(validate) && !validate(options)) {
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
