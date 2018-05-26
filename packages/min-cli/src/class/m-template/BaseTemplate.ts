import * as path from 'path'
import core, { loader } from '@mindev/min-core'
import { Depend } from '../Depend'
import { Request } from '../Request'
import { WxSFM } from '../WxSFM'
import util, { config, dom, log, beautifyHtml, getOuterHTML } from '../../util'
import { RequestType } from '../../declare'

const { DomUtils } = require('htmlparser2')

export namespace BaseTemplate {
  export interface Options {

    /**
     * 预编译语言
     *
     * @type {string}
     * @memberof Options
     */
    lang: string

    /**
     * 当前模块所在的引用路径
     *
     * @type {string}
     * @memberof Options
     */
    referenceSrc?: string

    /**
     * 引用组件
     *
     * @type {{ [key: string]: string }}
     * @memberof Options
     */
    usingComponents?: {
      [key: string]: string
    }
  }
}

/**
 * TEMPLATE 模块类
 *
 * @export
 * @class BaseTemplate
 * @extends {WxSFM}
 */
export class BaseTemplate extends WxSFM {
  /**
   * DOM 树
   *
   * @type {*}
   * @memberof BaseTemplate
   */
  dom: any

  /**
   * 自定义标签元素列表，它是this.dom 内与 usingComponents 引用匹配的元素集合
   *
   * @type {any[]}
   * @memberof BaseTemplate
   */
  customElems: any[] = []

  importElems: any[] = []
  imageElems: any[] = []
  wxsElems: any[] = []

  /**
   * 依赖列表
   *
   * @private
   * @type {Depend[]}
   * @memberof BaseTemplate
   */
  private depends: Depend[] = []

  /**
   * Creates an instance of BaseTemplate.
   * @param {string} source
   * @param {Request} request
   * @param {BaseTemplate.Options} options
   * @memberof BaseTemplate
   */
  constructor (source: string, request: Request, public options: BaseTemplate.Options) {
    super(source, request, {
      destExt: config.ext.wxml,
      referenceSrc: options.referenceSrc
    })
    this.initSource()
  }

  /**
   * 生成代码
   *
   * @returns {string}
   * @memberof BaseTemplate
   */
  async generator (): Promise<string> {
    let code = ''
    if (!this.dom) return code

    // this.setCustomTagPidAttr()

    // code = DomUtils.getOuterHTML(this.dom)
    code = getOuterHTML(this.dom)
    code = beautifyHtml(code)

    return code
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof BaseTemplate
   */
  getDepends (): Depend[] {
    return this.depends
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof BaseTemplate
   */
  updateDepends (useRequests: Request.Core[]): void {
    let depends = this.getDepends()

    if (!depends.length) return

    useRequests.forEach(useRequest => {
      depends
      .filter(depend => {
        return depend.requestType === useRequest.requestType && depend.request === useRequest.request
      })
      .forEach(depend => {
        let request = ''
        request = path.relative(path.dirname(this.dest), path.dirname(useRequest.dest))
        request = path.join(request, path.basename(useRequest.dest))
        request = request.charAt(0) !== '.' ? `./${request}` : request
        request = request.split(path.sep).join('/')

        switch (depend.requestType) {
          case RequestType.TEMPLATE:
          case RequestType.IMAGE:
          case RequestType.WXS:
            depend.$elem.attribs['src'] = request
            break
        }
      })
    })
  }

  protected initSource () {
    let { source } = this
    let { lang = 'wxml' } = this.options

    this.source = this.comiple(this.rawSource, lang)
  }

  /**
   * 初始化 DOM 节点树
   *
   * @private
   * @memberof BaseTemplate
   */
  protected initDom () {
    this.dom = dom.make(this.source)
  }

  protected initElem () {
    if (!this.dom) return

    let { usingComponents = {} } = this.options

    // get all custom tag
    this.customElems = DomUtils.getElementsByTagName((name: string) => {
      return !!usingComponents[name]
    }, this.dom, true, [])

    this.importElems = DomUtils.getElementsByTagName('import', this.dom, true, [])
    this.imageElems = DomUtils.getElementsByTagName('image', this.dom, true, [])
    this.wxsElems = DomUtils.getElementsByTagName('wxs', this.dom, true, [])
  }

  /**
   * Init Depend
   *
   * @private
   * @memberof BaseTemplate
   */
  protected initDepend () {

    // import tag
    this.importElems.forEach((elem: any) => {
      this.addDepend(elem, RequestType.TEMPLATE)
    })

    // image tag
    this.imageElems.forEach((elem: any) => {
      this.addDepend(elem, RequestType.IMAGE)
    })

    // wxs tag
    this.wxsElems.forEach((elem: any) => {
      this.addDepend(elem, RequestType.WXS)
    })

    // custom tag
    this.customElems.forEach((elem: any) => {
      let { src } = elem.attribs
      if (!src) return

      // Check local file
      if (!util.checkLocalFile(src)) return

      let extName = path.extname(src)
      switch (extName) {
        case config.ext.png:
        case config.ext.jpg:
        case config.ext.jpeg:
        case config.ext.gif:
        case config.ext.webp:
          this.addDepend(elem, RequestType.IMAGE)
          break

        case '':
          log.warn(`Unknown file extension: "${src}", It is the SRC attribute of the <${elem.name}/> tag, in ${this.request.srcRelative}`)
          break

        default:
          log.warn(`Unable to match the file extension: "${src}", It is the SRC attribute of the <${elem.name}/> tag, in ${this.request.srcRelative}`)
          break
      }
    })
  }

  private comiple (source: string, lang: string): string {
    let compiler = loader.loadCompiler(lang)

    if (!compiler) {
      throw new Error(`未发现相关 ${lang} 编译器配置，请检查min.config.js文件或尝试运行命令 "npm install @mindev/min-compiler-${lang} --save-dev" 进行安装.`)
    }

    if (!source) {
      return ''
    }

    if (lang === 'pug') {
      let indent = core.util.getIndent(source)
      if (indent.firstLineIndent) {
        source = core.util.fixIndent(source, indent.firstLineIndent * -1, indent.char)
      }
    }

    if (compiler.sync) {
      let result = compiler.sync({
        cwd: config.cwd,
        filename: this.request.src,
        config: config.compilers[lang],
        extend: {
          code: source
        }
      })

      let { extend: { code = '' } = {} } = result

      source = code
    }

    return source
  }

  /**
   * Add Depend
   *
   * @private
   * @param {*} elem
   * @param {*} requestType
   * @memberof BaseTemplate
   */
  private addDepend (elem: any, requestType: any) {
    let { src } = elem.attribs
    if (!src) return

    // Check local file
    if (!util.checkLocalFile(src)) return

    this.depends.push({
      parent: this.dependParent,
      request: src,
      requestType,
      $elem: elem
    })
  }

  /**
   * 设置 自定义标签的 pid 属性
   *
   * @private
   * @memberof BaseTemplate
   */
  // private setCustomTagPidAttr () {
  //   // set _pid
  //   this.customElems.forEach((elem: any) => {
  //     elem.attribs = elem.attribs || {}
  //     elem.attribs[PID_KEY] = `{{${PID_KEY}}}`
  //   })
  // }
}
