import { Depend, Request, WxFile, WxSFMScript, WxSFMStyle, WxSFMTemplate } from '../class'
import { dom, getRenderExps, xcxNext } from '../util'
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
  styles: WxSFMStyle[]
  script: WxSFMScript

  /**
   * Creates an instance of WxSFC.
   * @param {string} source
   * @param {Request} request
   * @memberof WxSFC
   */
  constructor (public source: string, public request: Request) {
    let {
      script, template, styles
    } = dom.getSFC(this.source, request.src)

    // SCRIPT
    this.script = new WxSFMScript(script.code, request, {
      lang: script.lang,
      referenceSrc: script.src
    })

    let usingComponents = this.script.getUsingComponents()

    // TEMPLATE
    this.template = new WxSFMTemplate(template.code, request, {
      lang: template.lang,
      referenceSrc: template.src,
      usingComponents
    })

    let renderExps = getRenderExps(this.template.dom)
    this.script.addRenderExps(renderExps)
    // console.log('>>>>>>>>>>>>>>>>>>>>', request.srcRelative, renderExps)

    // STYLE
    this.styles = styles.map(style => {
      return new WxSFMStyle(style.code, request, {
        lang: style.lang,
        referenceSrc: style.src
      })
    })
  }

  /**
   * 单文件模块列表，包括模板，脚本和样式
   *
   * @readonly
   * @memberof WxSFC
   */
  get sfms () {
    return [this.template, ...this.styles, this.script]
  }

  /**
   * 保存文件
   *
   * @memberof WxSFC
   */
  save () {
    this.template.save()
    this.script.save()

    if (this.styles.length > 0) {
      let generators = this.styles.map(style => style.generator())

      Promise
        .all(generators)
        .then((values) => {
          let content = values.join('\n')
          let style = this.styles[0]

          style.beforeSave()
          style.saveContent(content)
          style.afterSave()
        })
        .catch(err => {
          core.util.error(err)
          xcxNext.add(this.request)
        })
    }

    // this.sfms.forEach(sfm => sfm.save())
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
   * 获取隐式引用，例如 less 预编译语言的代码里 import 了外部文件、单文件模块的 src 外部文件
   *
   * @returns {string[]}
   * @memberof WxSFC
   */
  getImplicitReferences (): string[] {
    return Array.prototype.concat.apply([], this.sfms.map(sfm => sfm.getImplicitReferences()))
  }
}
