
import { CLIExample } from '../class'
import { DevType } from '../declare'
import util, { config, exec, log, LogType } from '../util'
import { NpmDest } from '../qa'

/**
 * 安装命令行选项
 *
 * @export
 * @interface InstallCommand
 */
export interface InstallCommand {}

export default {
  isAvailable (devType?: DevType) {
    // TODO
  },
  name: 'install <name>',
  alias: 'i',
  usage: '<name>',
  description: '安装组件',
  options: [],
  on: {
    '--help': () => {
      new CLIExample('install')
        .group('安装loading组件')
        .rule('@minui/wxc-loading')

        .group('支持英文逗号分隔，来同时安装多个组件')
        .rule('@minui/wxc-loading,@minui/wxc-loading')
    }
  },
  async action (name: string, options: InstallCommand) {
    let pkgNames: string[] = name.trim().split(',')

    try {
      await NpmDest.setAnswer()
      await install(pkgNames)
      util.buildNpmWXCs(pkgNames)
      // await viewUse(pkgNames)
    } catch (err) {
      log.error(err)
    }
  }
}

async function install (pkgNames: string[]) {
  // print run log
  pkgNames.forEach(pkgName => {
    log.msg(LogType.RUN, `npm install ${pkgName} --save`)
  })
  log.newline()

  // run npm install
  await exec('npm', ['install', ...pkgNames, '--save'], true, {
    cwd: config.cwd
  })
  log.newline()
}

// function viewUse (pkgNames: string[]) {
//   pkgNames.forEach(pkgName => {
//     log.msg(LogType.COMPLETE, `${pkgName} 安装完成，in ${path.join(config.npm.dest, pkgName)}`)
//   })
// }
