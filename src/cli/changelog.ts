import { CLIExample } from '../class'
import { DevType } from '../declare'
import { log } from '../util'

/**
 * 更新日志命令行选项
 *
 * @export
 * @interface ChangelogCommand
 */
export interface ChangelogCommand {}

export default {
  isAvailable (devType?: DevType) {
    if (!devType) {
      return false
    }

    // 判断 wxc 框架类型
    return devType.framework === 'wxc'
  },
  name: 'changelog',
  alias: 'log',
  usage: '',
  description: '更新日志',
  options: [],
  on: {
    '--help': () => {
      new CLIExample('changelog')
        .group('更新日志')
        .rule('')
    }
  },
  action (options: ChangelogCommand) {
    const standardVersion = require('standard-version')

    // 生成 CHANGELOG.md 更新日志文档
    standardVersion({
      noVerify: true,
      infile: 'CHANGELOG.md',
      silent: true
    }, function (err: Error) {
      if (err) {
        log.error(`changelog failed with message: ${err.message}`)
      }
    })
  }
}
