import * as fs from 'fs-extra'
import * as path from 'path'
import * as _ from 'lodash'
import { CLIExample } from '../class'
import { DevType } from '../declare'
import util, { config, exec, log } from '../util'

/**
 * 更新命令行选项
 *
 * @export
 * @interface UpdateCommand
 */
export interface UpdateCommand {}

export default {
  isAvailable (devType?: DevType) {
    // TODO
  },
  name: 'update [name]',
  alias: 'u',
  usage: '[name]',
  description: '更新组件',
  options: [],
  on: {
    '--help': () => {
      new CLIExample('min update')
        .group('更新')
        .rule('')
    }
  },
  async action (name: string, options: UpdateCommand) {
    let pkgNames: string[] = []

    if (name) { // from cli
      pkgNames = name.trim().split(' ')
    } else { // from dependencies and devDependencies
      let pkgPath = path.join(config.cwd, 'package.json')

      if (fs.existsSync(pkgPath)) {
        let pkgData = fs.readJsonSync(pkgPath)
        pkgNames = _.keys(_.assign(pkgData.dependencies, pkgData.devDependencies))
      }
    }

    if (pkgNames.length === 0) {
      log.error(`Min Update，没有需要更新的组件`)
      return
    }

    try {
      await exec('npm', ['update', ...pkgNames], true, {
        cwd: config.cwd
      })

      util.buildNpmWXCs(pkgNames)
    } catch (err) {
      console.log(err)
    }
  }
}
