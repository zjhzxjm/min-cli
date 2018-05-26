import { Depend, Request } from '../class'
import { WxFile } from '../class'
import { NativeTemplate } from '../class/m-template'
import { NativeStyle } from '../class/m-style'
import { NativeScript } from '../class/m-script'

/**
 * 原生文件类
 *
 * @export
 * @class WxNFC
 * @implements {WxFile.Core}
 */
export class WxNFC implements WxFile.Core {
  nativeModule: NativeTemplate | NativeStyle | NativeScript

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
      this.nativeModule = new NativeScript(this.source, request, {
        lang
      })
    } else if (isStyle) {
      // STYLE
      this.nativeModule = new NativeStyle(this.source, request, {
        lang
      })
    } else if (isTemplate) {
      // TEMPLATE
      this.nativeModule = new NativeTemplate(this.source, request, {
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
    this.nativeModule.save()
  }

  /**
   * 移除文件
   *
   * @memberof WxNFC
   */
  remove () {
    this.nativeModule.remove()
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof WxNFC
   */
  getDepends (): Depend[] {
    return this.nativeModule.getDepends()
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof WxNFC
   */
  updateDepends (useRequests: Request.Core[]): void {
    this.nativeModule.updateDepends(useRequests)
  }

  /**
   * 获取隐式引用，例如 less 预编译语言的代码里 import 了外部文件、单文件模块的 src 外部文件
   *
   * @returns {string[]}
   * @memberof WxSFC
   */
  getImplicitReferences (): string[] {
    return this.nativeModule.getImplicitReferences()
  }
}
