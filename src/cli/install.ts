import { CLIExample } from '../class'
import { DevType } from '../declare'
import util, { config, exec } from '../util'

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
      new CLIExample('min install')
        .group('安装')
        .rule('')
    }
  },
  async action (name: string, options: InstallCommand) {
    let pkgNames: string[] = name.trim().split(' ')

    try {
      await exec('npm', ['install', ...pkgNames, '--save'], true, {
        cwd: config.cwd
      })

      // 编译
      util.buildNpmWXCs(pkgNames)

    } catch (err) {
      console.log(err)
    }
  }
}
