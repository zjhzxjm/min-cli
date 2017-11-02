import * as fs from 'fs-extra'
import { Depend, Request, WxNFC, WxSFC } from '../class'
import { log } from '../util'

export namespace WxFile {
  /**
   * 文件管理核心接口
   *
   * @export
   * @interface Core
   */
  export interface Core {

    /**
     * 保存文件
     *
     * @memberof Core
     */
    save() :void

    /**
     * 移除文件
     *
     * @memberof Core
     */
    remove() :void

    /**
     * 获取依赖列表
     *
     * @returns {Depend[]}
     * @memberof Core
     */
    getDepends(): Depend[]

    /**
     * 更新依赖列表
     *
     * @param {Request.Core[]} useRequests 可用的请求列表
     * @memberof Core
     */
    updateDepends(useRequests: Request.Core[]): void
  }
}


/**
 * 文件管理类，主要负责单文件和原生文件的统一接口转换
 *
 * @export
 * @class WxFile
 * @implements {WxFile.Core}
 */
export class WxFile implements WxFile.Core {
  private core: WxFile.Core


  /**
   * Creates an instance of WxFile.
   * @param {Request} request
   * @memberof WxFile
   */
  constructor(request: Request) {
    let { ext, src, isSFC, isNFC } = request
    let source = fs.readFileSync(src, 'utf-8')

    log.msg(log.type.BUILD, request.srcRelative)

    if (isSFC) { // 单文件
      this.core = new WxSFC(source, request)
    } else if (isNFC) { // 原生文件
      this.core = new WxNFC(source, request)
    } else {
      throw new Error(`创建【WxFile】失败，没有找到扩展名为 ${ext} 的编译类型`)
    }
  }

  /**
   * 保存文件
   *
   * @memberof WxFile
   */
  save(): void {
    this.core.save()
  }

  /**
   * 移除文件
   *
   * @memberof WxFile
   */
  remove(): void {
    this.core.remove()
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof WxFile
   */
  getDepends(): Depend[] {
    return this.core.getDepends()
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof WxFile
   */
  updateDepends(useRequests: Request.Core[]): void {
    this.core.updateDepends(useRequests)
  }
}
