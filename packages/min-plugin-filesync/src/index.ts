import * as _ from 'lodash'
import filesync from './filesync'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import Options = FilesyncPlugin.Options
import Config = FilesyncPlugin.Config

export default class FilesyncPlugin implements Plugin {
  useway = 'alone'

  constructor (public options: Options) {
    // this.options = Object.assign({}, this.options)
  }

  async apply (pluginOptions: PluginOptions): Promise<string> {
    let { options } = this
    let { cwd, filename, output } = pluginOptions
    let config = this.getConfig()
    let p
    output('变更', filename)

    try {
      filesync(cwd, filename, config)
      p = Promise.resolve('done')
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }

  private getConfig (): Config[] {
    let config: Config[] = []

    let options = this.options || {}

    if (!_.isUndefined(options.from) && !_.isUndefined(options.to)) {
      config = [...config, options]
    }
    else if (_.isArray(options)) {
      config = [...config, ...options]
    }
    else if (_.isObject(options)) {
      _.forIn(options, (value: Config, key: string) => {
        config.push(value)
      })
    }

    return config
  }
}
