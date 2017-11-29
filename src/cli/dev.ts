import { CLIExample, Xcx, XcxNode } from '../class'
import util, { Global } from '../util'

export namespace DevCommand {

  /**
   * 选项
   *
   * @export
   * @interface Options
   */
  export interface Options {
    /**
     * 页面列表，如['pages/home/index', 'pages/loading/index']
     *
     * @type {string[]}
     * @memberof Options
     */
    pages?: string[],

    /**
     * 是否启用watch
     *
     * @type {boolean}
     * @memberof Options
     */
    watch?: boolean

    /**
     * 是否清除编译后的目录
     *
     * @type {boolean}
     * @memberof Options
     */
    clear?: boolean
  }

  /**
   * CLI选项
   *
   * @export
   * @interface CLIOptions
   */
  export interface CLIOptions {

  }
}

/**
 * 开发类
 *
 * @export
 * @class DevCommand
 */
export class DevCommand {
  constructor (public options: DevCommand.Options) {
  }

  async run () {
    let { pages, watch, clear } = this.options
    let xcx = new Xcx({
      isClear: clear,
      app: {
        isSFC: true
      },
      pages,
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
    watch && xcx.watch()

    return Promise.resolve()
  }
}

/**
 * Commander 命令行配置
 */
export default {
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
  async action (name: string, options: DevCommand.CLIOptions) {
    Global.isDebug = !!name

    let pages = util.pageName2Pages(name)
    let devCommand = new DevCommand({
      pages,
      watch: true,
      clear: true
    })
    await devCommand.run()
  }
}
