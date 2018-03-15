import * as _ from 'lodash'
import { pd } from 'pretty-data'
import { PluginHelper } from '@mindev/min-core'

const DEFAULTS: FileminPlugin.Options = {
  config: {},
  test: new RegExp('\.(wxml|xml|wxss|json)$'),
  filter (options: PluginHelper.Options) {
    return true
  }
}

export namespace FileminPlugin {
  export interface Config {}

  export interface Options {
    config: Config
    test: RegExp
    filter (options: PluginHelper.Options): boolean
  }
}

export default class FileminPlugin extends PluginHelper.TextPlugin {

  constructor (public options: FileminPlugin.Options) {
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

    try {
      // output('压缩', filename)

      if (/\.(wxml|xml)$/.test(filename)) {
        content = pd.xmlmin(content)
      }
      else if (/\.wxss$/.test(filename)) {
        content = pd.cssmin(content)
      }
      else if (/\.json$/.test(filename)) {
        content = pd.jsonmin(content)
      }

      _.merge(options, { extend: { content } })
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }
}
