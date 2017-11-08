import * as path from 'path'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import { CLIExample, Xcx, XcxNode } from '../class'
import { DevType, ProjectType } from '../declare'
import util, { Global, config, log } from '../util'

/**
 * 构建命令行选项
 *
 * @export
 * @interface BuildCommand
 */
export interface BuildCommand {
}

export default {
  isAvailable (devType?: DevType) {
    if (!devType) {
      return false
    }

    // 判断 wxc 框架类型
    return devType.framework === 'wxc'
  },
  name: 'build',
  alias: '',
  usage: '',
  description: '编译项目',
  options: [],
  on: {
    '--help': () => {
      new CLIExample('build')
        .group('编译')
        .rule('')
    }
  },
  action (options: BuildCommand) {
    switch (config.projectType as ProjectType) {
      case ProjectType.Application:
      case ProjectType.Component:
        {
          buildForMinProject()
        }
        break

      default:
        {
          buildForNpmDepends()
        }
        break
    }
  }
}

function buildForMinProject () {
  let xcx = new Xcx({
    isClear: true,
    app: {
      isSFC: true
    },
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
}

function buildForNpmDepends () {
  let pkgNames: string[] = []

  let pkgPath = path.join(config.cwd, 'package.json')

  if (fs.existsSync(pkgPath)) {
    let pkgData = fs.readJsonSync(pkgPath)
    pkgNames = _.keys(_.assign(pkgData.dependencies, pkgData.devDependencies))
  }

  if (pkgNames.length === 0) {
    log.error(`Min Build，没有需要编译的组件`)
    return
  }

  util.buildNpmWXCs(pkgNames)
}
