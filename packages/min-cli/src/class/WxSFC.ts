import { Depend, Request, WxFile, WxSFMScript, WxSFMStyle, WxSFMTemplate } from '../class'
import { dom } from '../util'
import core from '@mindev/min-core'

/**
 * 单文件组合类
 *
 * @export
 * @class WxSFC
 * @implements {WxFile.Core}
 */
export class WxSFC implements WxFile.Core {
  /**
   * 单文件组合，与.js、.json、.wxml、.wxss组件成一体 (单文件组件、单文件页面、单文件应用)
   */
  template: WxSFMTemplate
  style: WxSFMStyle
  script: WxSFMScript

  /**
   * Creates an instance of WxSFC.
   * @param {string} source
   * @param {Request} request
   * @memberof WxSFC
   */
  constructor (public source: string, request: Request) {
    let {
      script, template, style
    } = dom.getSFC(this.source)

    // SCRIPT
    this.script = new WxSFMScript(script.code, request, {
      lang: script.lang
    })

    let usingComponents = this.script.getUsingComponents()

    // TEMPLATE
    this.template = new WxSFMTemplate(template.code, request, {
      lang: template.lang,
      usingComponents
    })

    // STYLE
    this.style = new WxSFMStyle(style.code, request, {
      lang: style.lang
    })
  }

  /**
   * 单文件模块列表，包括模板，脚本和样式
   *
   * @readonly
   * @memberof WxSFC
   */
  get sfms () {
    return [this.template, this.style, this.script]
  }

  /**
   * 保存文件
   *
   * @memberof WxSFC
   */
  save () {
    this.sfms.forEach(sfm => sfm.save())
  }

  /**
   * 移除文件
   *
   * @memberof WxSFC
   */
  remove () {
    this.sfms.forEach(sfm => sfm.remove())
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof WxSFC
   */
  getDepends (): Depend[] {
    return Array.prototype.concat.apply([], this.sfms.map(sfm => sfm.getDepends()))
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof WxSFC
   */
  updateDepends (useRequests: Request.Core[]): void {
    this.sfms.forEach(sfm => sfm.updateDepends(useRequests))
  }

  /**
   * 获取内部依赖，例如 less 预编译语言的代码里 import 了外部文件
   *
   * @returns {string[]}
   * @memberof WxSFC
   */
  getInternalDepends (): string[] {
    return Array.prototype.concat.apply([], this.sfms.map(sfm => sfm.getInternalDepends()))
  }
}
