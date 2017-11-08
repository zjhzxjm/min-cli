import * as fs from 'fs-extra'
import * as path from 'path'
import * as _ from 'lodash'
import { CLIExample } from '../class'
import { DevType } from '../declare'
import util, { config, exec, log, LogType } from '../util'
import { NpmDest } from '../qa'

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
      new CLIExample('update')
        .group('更新已安装的组件')
        .rule('')

        .group('更新loading组件')
        .rule('@minui/wxc-loading')

        .group('支持英文逗号分隔，来同时更新多个组件')
        .rule('@minui/wxc-loading,@minui/wxc-loading')
    }
  },
  async action (name: string, options: UpdateCommand) {

    let pkgNames = getPkgNames(name)

    if (pkgNames.length === 0) {
      log.warn('没有找到需要更新的组件')
      return
    }

    try {
      await NpmDest.setAnswer()
      await update(pkgNames)
      util.buildNpmWXCs(pkgNames)
    } catch (err) {
      log.error(err)
    }
  }
}

function getPkgNames (name: string) {
  let pkgNames: string[] = []

  if (name.trim()) { // from cli
    pkgNames = name.trim().split(',')
  } else { // from dependencies and devDependencies
    let pkgPath = path.join(config.cwd, 'package.json')

    if (fs.existsSync(pkgPath)) {
      let pkgData = fs.readJsonSync(pkgPath)
      pkgNames = _.keys(_.assign(pkgData.dependencies, pkgData.devDependencies))
    }
  }
  return pkgNames
}

async function update (pkgNames: string[]) {
  // print run log
  pkgNames.forEach(pkgName => {
    log.msg(LogType.RUN, `npm update ${pkgName}`)
  })
  log.newline()

  // run npm update
  await exec('npm', ['update', ...pkgNames], true, {
    cwd: config.cwd
  })
  log.newline()
}
