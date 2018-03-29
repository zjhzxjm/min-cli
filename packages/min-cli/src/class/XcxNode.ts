import * as path from 'path'
import { Request, WxFile, Depend } from '../class'
import { log, xcxCache, xcxNext, config, src2destRelative } from '../util'
import core from '@mindev/min-core'

export namespace XcxNode {
  export interface Options extends Request.Options {
    /**
     * 强制创建，不管在不在缓存区里，都要创建一个xcxNode
     *
     * @type {boolean}
     * @memberof Options
     */
    isForce?: boolean,

    /**
     * 父节点
     *
     * @type {XcxNode}
     * @memberof Options
     */
    root?: XcxNode
  }
}

/**
 * 小程序节点类，用于创建生成节点树
 *
 * @export
 * @class XcxNode
 */
export class XcxNode {

  /**
   * 请求地址
   *
   * @type {Request}
   * @memberof XcxNode
   */
  request: Request

  /**
   * 子节点列表
   *
   * @type {XcxNode[]}
   * @memberof XcxNode
   */
  children: XcxNode[] = []

  /**
   * 文件处理器
   *
   * @type {WxFile}
   * @memberof XcxNode
   */
  wxFile: WxFile = null

  /**
   * 可用的请求列表
   *
   * @type {Request.Core[]}
   * @memberof XcxNode
   */
  useRequests: Request.Core[] = []

  /**
   * Creates an instance of XcxNode.
   * @param {Request} request
   * @param {XcxNode} [root]
   * @memberof XcxNode
   */
  constructor (request: Request, root?: XcxNode) {
    if (root) {
      root.children.push(this)
    }
    xcxCache.add(request, this)

    try {
      this.request = request
      this.wxFile = new WxFile(request)
      this.recursive()
    } catch (err) {
      core.util.error(err)
      xcxNext.add(request)
    }
  }

  /**
   * 创建一个小程序节点树
   *
   * @static
   * @param {XcxNode.Options} options
   * @returns {(XcxNode | null)}
   * @memberof XcxNode
   */
  static create (options: XcxNode.Options): XcxNode | null {
    let { isMain, isForce, root } = options

    if (isMain && root) {
      core.util.warn(`XcxNode.create 不能同时设定'option.isMain' 和 'option.root'`)
    }

    let request = new Request(options)

    if (!request.src) {
      if (isMain) {
        core.util.error(`没有找到入口：${request.request}`)
      } else if (root) {
        core.util.error(`没有找到模块：${request.request} in ${root.request.srcRelative}`)
      } else {
        core.util.error(`没有找到文件：${request.request}`)
      }
      return null
    }

    let xcxNode = xcxCache.get(request.src)

    if (isForce || !xcxNode) {
      xcxNode = new XcxNode(request, root)
    }

    return xcxNode
  }

  /**
   * 编译，更新依赖列表和保存文件
   *
   * @memberof XcxNode
   */
  compile () {
    let { wxFile } = this
    if (!wxFile) return

    wxFile.updateDepends(this.useRequests)
    wxFile.save()
  }

  /**
   * 递归依赖
   *
   * @private
   * @memberof XcxNode
   */
  private recursive () {
    let { wxFile } = this

    if (!wxFile) {
      return
    }

    let depends = wxFile.getDepends()

    for (let i = 0; i < depends.length; i++) {
      let depend = depends[i]
      let { request, requestType, isVirtual } = depend

      if (isVirtual) {
        this.resolveVirtual(depend)
        continue
      }

      // 创建一个节点
      let xcxNode = XcxNode.create({
        request,
        requestType,
        parent: this.request.src,
        isMain: false,
        root: this,
        isThreeNpm: this.request.isThreeNpm
      })

      if (xcxNode) {
        this.useRequests.push({
          request,
          requestType,
          src: xcxNode.request.src,
          srcRelative: xcxNode.request.srcRelative,
          ext: xcxNode.request.ext,
          dest: xcxNode.request.dest,
          destRelative: xcxNode.request.destRelative,
          isThreeNpm: xcxNode.request.isThreeNpm
        })
      } else {
        xcxNext.add(this.request)
      }
    }
  }

  private resolveVirtual (depend: Depend) {
    let { request, requestType } = depend
    let virtualPath = config.resolveVirtual[request]
    if (!virtualPath) {
      return
    }
    if (!path.isAbsolute(virtualPath)) {
      virtualPath = path.join(config.cwd, virtualPath)
    }

    if (!path.extname(virtualPath)) {
      virtualPath += config.ext.js
    }

    let src = virtualPath
    let srcRelative = path.relative(config.cwd, src)
    let destRelative = src2destRelative(srcRelative)
    let dest = path.join(config.cwd, destRelative)

    this.useRequests.push({
      request,
      requestType,
      src,
      srcRelative,
      ext: config.ext.js,
      dest,
      destRelative,
      isThreeNpm: true,
      isVirtual: true
    })
  }
}
