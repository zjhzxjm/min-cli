import * as _ from 'lodash'
import * as postcss from 'postcss'
import * as autoprefixer from 'autoprefixer'
import { PluginHelper } from '@mindev/min-core'

const DEFAULTS: AutoprefixerPlugin.Options = {
  config: {
    browsers: ['Android >= 2.3', 'Chrome > 20', 'iOS >= 6']
  },
  filter: new RegExp('\.(wxss)$'),
  validate (options: PluginHelper.Options) {
    return true
  }
}

export namespace AutoprefixerPlugin {
  export interface Config {
    browsers: string[]
  }

  export interface Options {
    config: Config
    filter: RegExp
    validate (options: PluginHelper.Options): boolean
  }
}

export default class AutoprefixerPlugin extends PluginHelper.TextPlugin {

  constructor (public options: AutoprefixerPlugin.Options) {
    super('AutoprefixerPlugin')

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

    // output('变更', filename)

    try {
      let processor = postcss([
        autoprefixer(config)
      ])
      content = await processor.process(content).then(result => result.css)

      _.merge(options, { extend: { content } })
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }
}
