import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'
import * as _ from 'lodash'
import * as chokidar from 'chokidar'
import { XcxNode, XcxTraverse } from '../class'
import { config, exec, log ,LogType, xcxNext, xcxCache, Global } from '../util'
import core, { loader, PluginHelper } from '@mindev/min-core'

export namespace Xcx {

  /**
   * 主入口
   *
   * @export
   * @interface Entry
   * @extends {XcxNode.Options}
   */
  export interface Entry extends XcxNode.Options {
    isGlob?: boolean
  }

  /**
   * 选项
   *
   * @export
   * @interface Options
   */
  export interface Options {
    isClear?: boolean
    packageNames?: string[]
    app?: {
      isSFC?: boolean
    },
    pages?: string[]
    traverse: XcxTraverse.Options
  }
}

/**
 * 小程序类，用于转换，编译和实时监听
 *
 * @export
 * @class Xcx
 */
export class Xcx {
  private isWatched: Boolean

  /**
   * Creates an instance of Xcx.
   * @param {Xcx.Options} options
   * @memberof Xcx
   */
  constructor (public options: Xcx.Options) {}

  /**
   * 解析节点树
   *
   * @param {(Xcx.Entry | Xcx.Entry[])} entry
   * @returns {XcxNode[]}
   * @memberof Xcx
   */
  parser (entry: Xcx.Entry | Xcx.Entry[]): XcxNode[] {
    let xcxNodes: XcxNode[] = []

    if (_.isArray(entry)) {
      entry.forEach(item => {
        xcxNodes = [...xcxNodes, ...this.parser(item)]
      })
    } else {
      if (entry.isGlob) {
        // 搜索文件结果
        let requests = glob.sync(entry.request, {
          cwd: entry.parent || config.cwd
        })
        // 创建入口文件配置
        let list: Xcx.Entry[] = requests.map(request => {
          return {
            ..._.omit(entry, 'isGlob'),
            request
          }
        })
        // 遍历
        xcxNodes = [...xcxNodes, ...this.parser(list)]
      } else {
        // 创建节点树
        let xcxNode = XcxNode.create(entry)
        if (xcxNode) {
          xcxNodes.push(xcxNode)
        }
      }
    }
    return xcxNodes
  }

  /**
   * 通过 Entry 入口生成节点树并进行转换
   *
   * @param {(Xcx.Entry | Xcx.Entry[])} entry
   * @memberof Xcx
   */
  transfromFromEntry (entry: Xcx.Entry | Xcx.Entry[]): void {
    let xcxNodes = this.parser(entry)
    this.transfrom(xcxNodes)
  }

  /**
   * 转换节点树
   *
   * @param {(XcxNode | XcxNode [])} xcxNode
   * @memberof Xcx
   */
  transfrom (xcxNode: XcxNode | XcxNode []) {
    XcxTraverse.traverse(xcxNode, this.options.traverse)
  }

  async filesyncPlugin (watch = false) {
    if (this['_isInitFilesyncPlugin']) {
      return
    }
    // TODO 如果用户改变 dest 路径，最终同步的文件将不对
    this['_isInitFilesyncPlugin'] = true

    let plugin = new PluginHelper(PluginHelper.Type.File, 'filesync')

    await plugin.apply({
      cwd: config.cwd,
      dest: config.dest,
      filename: null,
      extend: {
        watch
      }
    })
  }

  /**
   * 编译
   *
   * @memberof Xcx
   */
  async compile (isFromWatch?: Boolean) {
    log.newline()
    this.clear(isFromWatch)
    this.appCompile()
    this.pagesCompile()
    this.subPackagesCompile()
    this.imagesCompile()
  }

  /**
   * 清空 packages 目录下 dest 下的文件
   *
   * @memberof Xcx
   */
  clearPackages () {
    let { isClear, packageNames = [] } = this.options
    if (!isClear) return

    packageNames.forEach(packageName => {
      fs.emptyDirSync(config.getPath('packages', packageName, config.package.dest))
    })
  }

  /**
   * 编译 packages 下的组件，仅用于 min publish
   *
   * @memberof Xcx
   */
  compilePackages () {
    this.clearPackages()
    let { packageNames = [] } = this.options
    let glob = ''
    if (packageNames.length === 0) {
      glob = '**'
    } else if (packageNames.length === 1) {
      glob = packageNames[0]
    } else {
      glob = `{${packageNames.join(',')}}`
    }
    // ./**/src/index.wxc
    glob = `./${glob}/${config.package.src}/*${config.ext.wxc}`
    let xcxEntry: Xcx.Entry = {
      request: glob,
      parent: config.getPath('packages'),
      isMain: true,
      isGlob: true,
      isPublish: true
    }

    this.transfromFromEntry(xcxEntry)
  }

  /**
   * 监听文件新增、修改、删除
   *
   * @memberof Xcx
   */
  watch (): chokidar.FSWatcher {
    let watcher = chokidar.watch([config.src, config.packages, config.filename], {
      cwd: config.cwd,
      ignored: /node_modules|\.git|\.txt|\.log|\.DS_Store|\.npmignore|package\.json/i,
      persistent: true,
      ignoreInitial: true
    })

    watcher
      .on('add', this.newFile.bind(this))
      .on('change', this.changeFile.bind(this))
      .on('unlink', this.removeFile.bind(this))
      .on('error', (err) => {
        log.fatal(err)
      })
      .on('ready', () => {
        if (!this.isWatched) {
          this.isWatched = true
          core.util.timeEnd('Xcx.compile')
          log.msg(LogType.WATCH, '开始监听文件改动.')
        }
      })

    return watcher
  }

  /**
   * 编译 从Next里获取监听变更文件，或者是之前存在缺失文件
   *
   * @memberof Xcx
   */
  next () {
    if (!xcxNext.exists) {
      return
    }

    core.util.debug('xcxNext.nexts', xcxNext.nexts)

    let xcxEntry: Xcx.Entry[] = xcxNext.nexts.map(src => {
      return {
        request: src,
        parent: config.cwd,
        isMain: true,
        isForce: true
      }
    })

    xcxNext.clear()
    log.newline()
    this.transfromFromEntry(xcxEntry)
    // core.util.log('正在监听文件改动.', '监听')
  }

  /**
   * 编译 APP 应用层
   *
   * @memberof Xcx
   */
  private appCompile () {
    // TODO 此处待优化CONFIG - START
    if (!config.app) {
      return
    }
    // TODO 此处待优化CONFIG - END

    let { app = {} } = this.options
    let { isSFC } = app
    let xcxEntry: Xcx.Entry = {
      request: isSFC ? `./app${config.ext.wxa}` : './app.{js,wxss}',
      parent: config.getPath('src'),
      isMain: true,
      isGlob: isSFC ? false : true
    }

    this.transfromFromEntry(xcxEntry)
  }

  /**
   * 编译 Pages 页面列表
   *
   * @private
   * @param {string[]} [pages]
   * @memberof Xcx
   */
  private pagesCompile () {
    const tabBarList: any[] = Global.appTabBarList
    /**
     * [
     *    pages/hello/index,
     *    pages/world/index
     * ]
     */
    let pages: string[] = this.options.pages || []
    if (pages.length === 0) {
      pages = Global.appPages || []
    }
    let xcxEntry: Xcx.Entry[] = []

    if (pages.length > 0) { // 优先编译命令行带过来的名称 或 app.json 里的 pages 字段
      let pageFiles: string[] = []

      /**
       * [
       *    pages/hello/index.wxp,
       *    pages/world/index.wxp
       * ]
       */
      pageFiles = [...pageFiles, ...pages.map(page => `${page}${config.ext.wxp}`)]

      // 合并 tabBar.List 的选项卡页面
      pageFiles = [...pageFiles, ...tabBarList.map(tabBarItem => `${tabBarItem.pagePath}${config.ext.wxp}`)]

      // 去重
      pageFiles = _.uniq(pageFiles)

      xcxEntry = [...xcxEntry, ...pageFiles.map(pageFile => {
        return {
          request: pageFile,
          parent: config.getPath('src'),
          isMain: true
        }
      })]
    } else { // 最后按照 模糊匹配所有的 .wxp 文件编译
      xcxEntry = [...xcxEntry, {
        request: `**/*${config.ext.wxp}`,
        parent: config.getPath('pages'),
        isMain: true,
        isGlob: true
      }]
    }

    this.transfromFromEntry(xcxEntry)
  }

  private subPackagesCompile () {
    let subPackages = Global.appSubPackages
    let xcxEntry: Xcx.Entry[] = _.concat([], ...subPackages.map(sPackage => {
      let { pages } = sPackage
      if (!pages.length) {
        return [
          {
            request: `${sPackage.root}/**/*${config.ext.wxp}`,
            parent: config.getPath('src'),
            isMain: true,
            isGlob: true
          }
        ]
      } else {
        return pages.map(page => {
          return {
            request: `${sPackage.root}/${page}${config.ext.wxp}`,
            parent: config.getPath('src'),
            isMain: true
          }
        })
      }
    }))

    this.transfromFromEntry(xcxEntry)
  }

  /**
   * 编译 Image 图片，只支持app.json里的 tabar 选项卡的 icon 图片路径
   *
   * @memberof Xcx
   */
  private imagesCompile () {
    const tabBarList: any[] = Global.appTabBarList

    // Array.prototype.concat.apply([], [[], [], []])
    const images: {origin: string, target: string}[] = Array.prototype.concat.apply([], tabBarList.map(tabBarItem => {
      let map: {origin: string, target: string}[] = []
      if (tabBarItem.iconPath) {
        map.push(
          {
            origin: config.getPath('src', tabBarItem.iconPath),
            target: config.getPath('dest', tabBarItem.iconPath)
          }
        )
      }
      if (tabBarItem.selectedIconPath) {
        map.push({
          origin: config.getPath('src', tabBarItem.selectedIconPath),
          target: config.getPath('dest', tabBarItem.selectedIconPath)
        })
      }
      return map
    }))

    images.forEach(image => {
      if (!fs.existsSync(image.origin)) {
        log.fatal(`找不到文件：${image.origin}`)
        return
      }
      fs.copySync(image.origin, image.target)
    })
  }

  /**
   * 监听新增
   *
   * @private
   * @param {string} filename
   * @memberof Xcx
   */
  private newFile (filename: string) {
    let src = path.join(config.cwd, filename)
    xcxNext.newFile(src)
    this.next()
  }

  /**
   * 监听变更
   *
   * @private
   * @param {string} filename
   * @memberof Xcx
   */
  private async changeFile (filename: string) {
    let isApp = filename === path.join(config.src, `app${config.ext.wxa}`)
    let isMinConfig = filename === config.filename

    if (isApp || isMinConfig) { // 重新编译
      config.reload()
      await loader.checkLoader(config)
      this.compile(true)
      // core.util.log('正在监听文件改动.', '监听')
      return
    }

    let src = path.join(config.cwd, filename)
    xcxNext.changeFile(src)
    this.next()
  }

  /**
   * 监听删除
   *
   * @private
   * @param {string} file
   * @memberof Xcx
   */
  private async removeFile (filename: string) {
    let isMinConfig = filename === config.filename

    if (isMinConfig) { // 重新编译
      config.reload()
      await loader.checkLoader(config)
      this.compile(true)
      // core.util.log('正在监听文件改动.', '监听')
      return
    }

    let src = path.join(config.cwd, filename)
    xcxNext.removeFile(src)
    this.next()
  }

  /**
   * Clear cache and dest dir
   *
   * @private
   * @param {Boolean} [isFromWatch] Is from the watch of chokidar
   * @memberof Xcx
   */
  private clear (isFromWatch?: Boolean) {
    let { isClear } = this.options

    if (!isClear) {
      return
    }

    Global.clear()
    xcxNext.clear()
    xcxCache.clear()

    if (!isFromWatch) {
      fs.emptyDirSync(config.getPath('dest'))
    }
  }
}
