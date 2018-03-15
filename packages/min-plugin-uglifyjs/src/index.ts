import * as _ from 'lodash'
import * as uglify from 'uglify-js'
import { PluginHelper } from '@mindev/min-core'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options

const DEFAULTS: UglifyjsPlugin.Options = {
  config: {
    compress: {
      warnings: false
    }
  },
  test: new RegExp('\.(js)$'),
  filter (options: PluginHelper.Options) {
    return true
  }
}

export namespace UglifyjsPlugin {
  export interface Config {
    compress: {
      warnings: boolean
    }
  }

  export interface Options {
    config: Config
    test: RegExp
    filter (options: PluginHelper.Options): boolean
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

    // output('压缩', filename)

    try {
      let result = uglify.minify(content, config)

      _.merge(options, { extend: { content: result.code } })
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }
}
