import { getInnerHTML } from '../util'
const { DomHandler, Parser, DomUtils } = require('htmlparser2')

/**
 * 将 source 转换成 dom 节点树
 *
 * @param {string} source
 * @returns
 */
function make (source: string) {
  let handler = new DomHandler()
  let parser = new Parser(handler, {
    lowerCaseAttributeNames: false
  })

  parser.write(source)
  parser.done()
  return handler.dom
}

/**
 * 获得单文件模块dom树
 *
 * @param {*} parent
 * @param {string} tagName
 * @returns
 */
function getSFM (parent: any, tagName: string) {
  let elem = DomUtils.getElementsByTagName(tagName, parent, true, [])[0]
  let code = ''
  let lang = ''

  if (elem) {
    // code = htmlparser.DomUtils.getInnerHTML(elem)
    code = getInnerHTML(elem)
    lang = elem.attribs.lang

    if (typeof lang !== 'undefined') {
      lang = lang.toLowerCase()
    }
  }
  return {
    code,
    lang
  }
}

/**
 * 获得单文件组件dom树
 *
 * @param {string} source
 * @returns
 */
function getSFC (source: string) {
  let elem = make(source)
  return {
    template: getSFM(elem, 'template'),
    style: getSFM(elem, 'style'),
    script: getSFM(elem, 'script')
  }
}

export const dom = {
  make,
  getSFM,
  getSFC
}
