import { CLIExample, Xcx, XcxNode } from '../class'
import { DevType } from '../declare'
import util, { Global } from '../util'

/**
 * 开发命令行选项
 *
 * @export
 * @interface DevCommand
 */
export interface DevCommand {

}

export default {
  isAvailable (devType?: DevType) {
    if (!devType) {
      return false
    }

    // 判断 wxc 框架类型
    return devType.framework === 'wxc'
  },
  name: 'dev [name]',
  alias: '',
  usage: '[name]',
  description: '调试页面',
  options: [],
  on: {
    '--help': () => {
      new CLIExample('dev')
        .group('调试项目')
        .rule('')

        .group('支持英文逗号分隔，来同时调试多个页面')
        .rule('home,loading')
    }
  },
  action (pageName: string, options: DevCommand) {
    Global.isDebug = !!pageName

    let xcx = new Xcx({
      isClear: true,
      app: {
        isSFC: true
      },
      pages: util.pageName2Pages(pageName),
      traverse: {
        enter (xcxNode: XcxNode) {
          xcxNode.compile()
        },
        pages (pages: string[]) {
          Global.saveAppConfig(pages)
        }
      }
    })
    xcx.compile()
    xcx.watch()
  }
}
