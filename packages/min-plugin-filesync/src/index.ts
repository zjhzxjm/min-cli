import * as path from 'path'
import * as _ from 'lodash'
import * as chokidar from 'chokidar'
import { PluginHelper } from '@mindev/min-core'
import filesync from './filesync'

export default class FilesyncPlugin extends PluginHelper.FilePlugin {

  constructor (public options: FilesyncPlugin.Options) {
    super()
  }

  apply (options: PluginHelper.Options): Promise<PluginHelper.Options> {
    let { cwd, dest = '', extend = {} } = options
    let { watch = false } = extend
    let p = Promise.resolve(options)

    if (!dest) {
      return p
    }

    try {
      this.watcher(cwd, dest, watch)
    }
    catch (err) {
      p = Promise.reject(err)
    }
    return p
  }

  private getConfigs (): FilesyncPlugin.Config[] {
    let config: FilesyncPlugin.Config[] = []

    let options = this.options || {}

    if (!_.isUndefined(options.from) && !_.isUndefined(options.to)) {
      config = [...config, options]
    }
    else if (_.isArray(options)) {
      config = [...config, ...options]
    }
    else if (_.isObject(options)) {
      _.forIn(options, (value: FilesyncPlugin.Config, key: string) => {
        config.push(value)
      })
    }

    return config
  }

  private async watchApply (cwd: string, dest: string, status: string, filename: string) {
    let configs = this.getConfigs()
    for (const config of configs) {
      await filesync(cwd, dest, filename, status, config)
    }
  }

  private watcher (cwd: string, dest: string, watch: boolean) {
    let watcher = chokidar.watch('.', {
      cwd,
      ignored: /node_modules|\.git|\.txt|\.log|\.DS_Store|\.npmignore|package\.json/i,
      persistent: true
    })

    watcher.unwatch(dest)

    watcher
      .on('add', this.watchApply.bind(this, cwd, dest, 'add'))
      .on('change', this.watchApply.bind(this, cwd, dest, 'change'))
      .on('unlink', this.watchApply.bind(this, cwd, dest, 'unlink'))
      .on('error', (err: Error) => {
        console.log(err)
      })
      .on('ready', () => {
        !watch && watcher.close()
      })
  }
}
