import * as path from 'path'
import { CLIExample } from '../class'
import { DevType } from '../declare'
import { execFileSync } from 'child_process'

/**
 * 提交命令行选项
 *
 * @export
 * @interface CommitCommand
 */
export interface CommitCommand {}

export default {
  isAvailable (devType?: DevType) {
    if (!devType) {
      return false
    }

    // 判断 wxc 框架类型
    return devType.framework === 'wxc'
  },
  name: 'commit',
  alias: 'ci',
  usage: '',
  description: '提交 MinUI 组件库',
  options: [],
  on: {
    '--help': () => {
      new CLIExample('commit')
        .group('提交')
        .rule('')
    }
  },
  action (options: CommitCommand) {
    execFileSync(path.join(__dirname, '../../node_modules/.bin/git-cz'), {
      stdio: ['inherit', 'inherit', 'inherit']
    })
  }
}
