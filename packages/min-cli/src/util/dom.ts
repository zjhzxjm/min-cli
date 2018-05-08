import * as fs from 'fs-extra'
import * as path from 'path'
import { Request } from '../class'
import { getInnerHTML } from '../util'
import { RequestType } from '../declare'
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
function getSFM (parentElem: any, tagName: string, parentFile?: string) {
  let elem = DomUtils.getElementsByTagName(tagName, parentElem, true, [])[0]

  if (!elem) {
    return {
      src: undefined,
      lang: undefined,
      code: ''
    }
  }

  return getModule(elem, parentFile)
}

function getSFMs (parentElem: any, tagName: string, parentFile?: string) {
  let elems = DomUtils.getElementsByTagName(tagName, parentElem, true, []) as any[]

  let sfms = elems.map(elem => getModule(elem, parentFile))

  if (sfms.length === 0) {
    sfms = [{
      src: undefined,
      lang: undefined,
      code: ''
    }]
  }

  return sfms
}

function getModule (elem: any, parentFile?: string) {
  let { src = undefined, lang = undefined } = elem.attribs || {}
  let code = ''

  if (src) {
    let request = new Request({
      request: src,
      parent: parentFile
    })

    if (!request.src) {
      throw new Error(`找不到文件${src}, in ${parentFile}`)
    } else {
      src = request.src
      code = fs.readFileSync(request.src, 'utf-8')
    }

    if (typeof lang === 'undefined') {
      lang = path.extname(request.src).replace(/^\./, '') || undefined
    }
  } else {
    src = undefined
    code = getInnerHTML(elem)
  }

  if (typeof lang !== 'undefined') {
    lang = lang.toLowerCase()
  }

  return { src, lang, code }
}

/**
 * 获得单文件组件dom树
 *
 * @param {string} source
 * @returns
 */
function getSFC (source: string, parentFile?: string) {
  let elem = make(source)
  return {
    template: getSFM(elem, 'template', parentFile),
    styles: getSFMs(elem, 'style', parentFile),
    script: getSFM(elem, 'script', parentFile)
  }
}

export const dom = {
  make,
  getSFM,
  getSFMs,
  getSFC
}
