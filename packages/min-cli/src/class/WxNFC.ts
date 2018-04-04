import { Depend, Request, WxFile, WxSFMTemplate, WxSFMScript, WxSFMStyle } from '../class'

/**
 * 原生文件类
 *
 * @export
 * @class WxNFC
 * @implements {WxFile.Core}
 */
export class WxNFC implements WxFile.Core {
  sfm: WxSFMTemplate | WxSFMStyle | WxSFMScript

  /**
   * Creates an instance of WxNFC.
   * @param {string} source
   * @param {Request} request
   * @memberof WxNFC
   */
  constructor (public source: string, public request: Request) {
    let { isScript, isStyle, isTemplate } = request
    let lang = request.ext.replace(/[^a-z]/, '')

    if (isScript) {
      // SCRIPT
      this.sfm = new WxSFMScript(this.source, request, {
        lang
      })
    } else if (isStyle) {
      // STYLE
      this.sfm = new WxSFMStyle(this.source, request, {
        lang
      })
    } else if (isTemplate) {
      // TEMPLATE
      this.sfm = new WxSFMTemplate(this.source, request, {
        lang
      })
    } else {
      throw new Error(`创建【WxNFC】失败，没有找到扩展名为 ${request.ext} 的编译类型`)
    }
  }

  /**
   * 保存文件
   *
   * @memberof WxNFC
   */
  save () {
    this.sfm.save()
  }

  /**
   * 移除文件
   *
   * @memberof WxNFC
   */
  remove () {
    this.sfm.remove()
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof WxNFC
   */
  getDepends (): Depend[] {
    return this.sfm.getDepends()
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof WxNFC
   */
  updateDepends (useRequests: Request.Core[]): void {
    this.sfm.updateDepends(useRequests)
  }

  /**
   * 获取内部依赖，例如 less 预编译语言的代码里 import 了外部文件
   *
   * @returns {string[]}
   * @memberof WxSFC
   */
  getInternalDepends (): string[] {
    return this.sfm.getInternalDepends()
  }
}
