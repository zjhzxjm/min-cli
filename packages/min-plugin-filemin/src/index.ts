import { pd } from 'pretty-data'
import { util, PluginHelper } from '@mindev/min-core'

const DEFAULTS: FileminPlugin.Options = {
  config: {},
  filter: new RegExp('\.(wxml|xml|wxss|json)$'),
  validate (options: PluginHelper.Options) {
    return true
  }
}

export namespace FileminPlugin {
  export interface Config {}

  export interface Options {
    config: Config
    filter: RegExp
    validate (options: PluginHelper.Options): boolean
  }
}

export default class FileminPlugin extends PluginHelper.TextPlugin {

  constructor (public options: FileminPlugin.Options) {
    super('FileminPlugin')

    this.options = {
      ...DEFAULTS,
      ...this.options
    }
  }

  apply (options: PluginHelper.Options): Promise<PluginHelper.Options> {
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

      util.merge(options, { extend: { content } })
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }
}
