import * as changeCase from 'change-case'
import { Request } from './Request'
import { WxTemplate } from './WxTemplate'
import { Global, config } from '../util'

const { DomUtils } = require('htmlparser2')

export class WxpTemplate extends WxTemplate {
  /**
   * example 元素，它是this.dom内第一个 <example></example> 标签嵌套的元素
   *
   * @type {*}
   * @memberof WxTemplate
   */
  exampleElem: any

  /**
   * demo-xxx 元素列表，它是this.dom内第一个 <example></example> 标签内 所有的<demo-xxx></demo-xxx> 标签嵌套的元素集合
   *
   * @type {any[]}
   * @memberof WxTemplate
   */
  demoElems: any[] = []

  constructor (source: string, request: Request, options: WxTemplate.Options) {
    super(source, request, options)

    this.initSource()
    this.initDom()
    this.initElem()
    this.initDepend()
    this.initExample()
  }

  protected initSource () {
    super.initSource()

    let { template } = Global.layout.app
    let { placeholder } = config.layout
    let { source } = this

    source = template.indexOf(placeholder) !== -1
      ? template.replace(placeholder, source)
      : source

    this.source = source
  }

  protected initElem () {
    super.initElem()

    // get one <example...> tag
    this.exampleElem = DomUtils.getElementsByTagName('example', this.dom, true, [])[0] || null

    if (!this.exampleElem) return

    // get all <demo-...> tag
    this.demoElems = DomUtils.getElementsByTagName((name: string) => {
      return /^demo-/.test(name)
    }, this.exampleElem, true, [])
  }

  private initExample () {
    this.addExampleMdDocTag()
    this.setExampleDemoSourceAttr()
  }

  /**
   * 添加 用于输出展示 doc-intro 和 doc-api 的 example-md 标签
   *
   * @private
   * @memberof WxTemplate
   */
  private addExampleMdDocTag () {
    if (!this.exampleElem) return

    // 插入一个 example-md 标签，并传入 content 属性，用于读取data上的 README.md 文件转后的 html 内容
    DomUtils.appendChild(this.exampleElem, {
      type: 'tag',
      name: 'example-md',
      attribs: {
        content: '{{__code__.readme}}'
        // [PID_KEY]: `{{${PID_KEY}}}`
      }
    }, null)

    // // 插入一个 example-md 标签，并传入 content 属性，用于读取data上的 doc-intro.md 文件转后的 html 内容
    // DomUtils.appendChild(this.exampleElem, {
    //   type: 'tag',
    //   name: 'example-md',
    //   attribs: {
    //     content: '{{__code__.docIntro}}',
    //     [PID_KEY]: `{{${PID_KEY}}}`
    //   }
    // }, null)

    // // 插入一个 example-md 标签，并传入 content 属性，用于读取data上的 doc-api.md 文件转后的 html 内容
    // DomUtils.appendChild(this.exampleElem, {
    //   type: 'tag',
    //   name: 'example-md',
    //   attribs: {
    //     content: '{{__code__.docApi}}',
    //     [PID_KEY]: `{{${PID_KEY}}}`
    //   }
    // }, null)

    // // 插入一个 example-md 标签，并传入 content 属性，用于读取data上的 doc-changelog.md 文件转后的 html 内容
    // DomUtils.appendChild(this.exampleElem, {
    //   type: 'tag',
    //   name: 'example-md',
    //   attribs: {
    //     content: '{{__code__.docChangeLog}}',
    //     [PID_KEY]: `{{${PID_KEY}}}`
    //   }
    // }, null)
  }

  /**
   * 设置 example-demo 的 source 属性，用于展示 <demo-xxx></demo-xxx> 组件的源代码
   *
   * @private
   * @memberof WxTemplate
   */
  private setExampleDemoSourceAttr () {
    if (!this.exampleElem) return

    // <demo-default></demo-default>
    this.demoElems.forEach((elem: any) => {
      let { parent } = elem
      // <example-demo title="" desc="">
      if (parent.name === 'example-demo' && !parent.attribs['source']) {
        let pcName = changeCase.camelCase(elem.name)
        parent.attribs['source'] = `{{__code__.${pcName}}}`
      }
    })
  }
}
