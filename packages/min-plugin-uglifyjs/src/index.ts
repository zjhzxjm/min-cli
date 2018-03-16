import * as _ from 'lodash'
import * as uglify from 'uglify-js'
import { PluginHelper } from '@mindev/min-core'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options

const DEFAULTS: UglifyjsPlugin.Options = {
  config: {
    warnings: false
  },
  filter: new RegExp('\.(js)$'),
  validate (options: PluginHelper.Options) {
    return true
  }
}

export namespace UglifyjsPlugin {
  export interface Config {
    warnings: boolean
  }

  export interface Options {
    config: Config
    filter: RegExp
    validate (options: PluginHelper.Options): boolean
  }
}

export default class UglifyjsPlugin extends PluginHelper.TextPlugin {

  constructor (public options: UglifyjsPlugin.Options) {
    super()

    this.options = {
      ...DEFAULTS,
      ...this.options
    }
  }

  apply (options: PluginHelper.Options): Promise<PluginHelper.Options> {
    let { filter, validate, config: $config } = this.options
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

    // output('压缩', filename)

    let config = _.cloneDeep($config)

    let result: any = uglify.minify(content, config)

    if (result.error) {
      p = Promise.reject(result.error)
    }
    else {
      _.merge(options, { extend: { content: result.code } })
    }

    return p
  }
}
