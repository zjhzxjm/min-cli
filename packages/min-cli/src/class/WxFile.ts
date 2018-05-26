import { Depend, Request } from '../class'
import { WxNFC, WxSFC, WxSRF } from '../class'
import util, { log, eslint } from '../util'

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
    save (): void

    /**
     * 移除文件
     *
     * @memberof Core
     */
    remove (): void

    /**
     * 获取依赖列表
     *
     * @returns {Depend[]}
     * @memberof Core
     */
    getDepends (): Depend[]

    /**
     * 更新依赖列表
     *
     * @param {Request.Core[]} useRequests 可用的请求列表
     * @memberof Core
     */
    updateDepends (useRequests: Request.Core[]): void

    /**
     * 获取隐式引用，例如 less 预编译语言的代码里 import 了外部文件、单文件模块的 src 外部文件
     *
     * @returns {string[]}
     * @memberof Core
     */
    getImplicitReferences (): string[]
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
  private file: WxFile.Core

  /**
   * Creates an instance of WxFile.
   * @param {Request} request
   * @memberof WxFile
   */
  constructor (public request: Request) {
    let { ext, src, isSFC, isNFC, isStatic, isThreeNpm } = request

    if (isSFC) { // 单文件

      log.msg(log.type.BUILD, request.srcRelative)
      this.file = new WxSFC(util.readFile(src), request)

    } else if (isNFC) { // 原生文件

      log.msg(log.type.BUILD, request.srcRelative)
      this.file = new WxNFC(util.readFile(src), request)

    } else if (isStatic) { // 静态文件

      this.file = new WxSRF(request)

    } else {
      throw new Error(`创建【WxFile】失败，没有找到扩展名为 ${ext} 的编译类型`)
    }

    if (!isThreeNpm) {
      eslint(src)
    }
  }

  /**
   * 保存文件
   *
   * @memberof WxFile
   */
  save (): void {
    this.file.save()
  }

  /**
   * 移除文件
   *
   * @memberof WxFile
   */
  remove (): void {
    this.file.remove()
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof WxFile
   */
  getDepends (): Depend[] {
    return this.file.getDepends()
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof WxFile
   */
  updateDepends (useRequests: Request.Core[]): void {
    this.file.updateDepends(useRequests)
  }

  /**
   * 获取隐式引用，例如 less 预编译语言的代码里 import 了外部文件、单文件模块的 src 外部文件
   *
   * @returns {string[]}
   * @memberof Core
   */
  getImplicitReferences (): string[] {
    return this.file.getImplicitReferences()
  }
}
