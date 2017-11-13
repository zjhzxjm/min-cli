'use strict'

import * as fs from 'fs-extra'
import { CLIExample } from '../class'
import { DevType } from '../declare'
import util, { config, log, LogType } from '../util'

export interface PackagesCommand {
  delete: boolean
  list: boolean
}

export default {
  isAvailable (devType?: DevType) {
    if (!devType) {
      return false
    }

    // 判断 wxc 框架类型
    return devType.framework === 'wxc'
  },
  name: 'packages [name]',
  alias: 'pkgs',
  usage: '[name] [-l | --list] [-d | --delete]',
  description: '管理 MinUI 组件库',
  options: [
    ['-l, --list', '查看组件列表'],
    ['-d, --delete', '删除组件']
  ],
  on: {
    '--help': () => {
      new CLIExample('packages')
        .group('列表')
        .rule('--list')
        .group('删除')
        .rule('--delete loading')
    }
  },
  action (name: string, options: PackagesCommand) {
    util.overrideNpmLog()

    if (options.delete) { // 删除
      if (!name) {
        log.error('[name] 名称不能为空')
        return
      }
      let pkgName = util.getRealPkgName(name)
      let pageName = util.getRealPageName(name)
      let pkgPath = config.getPath('packages', pkgName)
      let pagePath = config.getPath('pages', pageName)

      fs.removeSync(pkgPath)
      fs.removeSync(pagePath)

      log.output(LogType.DELETE, `组件 "${pkgName}"`, pkgPath)
      log.output(LogType.DELETE, `页面 "${pageName}"`, pagePath)
    } else { // 列表
      util.setLernaConfig()
      let { LsCommand } = require('lerna')
      let lsCommand = new LsCommand(['ls'], {}, config.cwd)

      lsCommand
        .run()
        .then()
    }
  }
}
