/* dom-serializer */

const ElementType = require('domelementtype')
const entities = require('entities')
const isTag = ElementType.isTag

/*
  Boolean Attributes
*/
const booleanAttributes = {
  __proto__: null,
  allowfullscreen: true,
  async: true,
  autofocus: true,
  autoplay: true,
  checked: true,
  controls: true,
  default: true,
  defer: true,
  disabled: true,
  hidden: true,
  ismap: true,
  loop: true,
  multiple: true,
  muted: true,
  open: true,
  readonly: true,
  required: true,
  reversed: true,
  scoped: true,
  seamless: true,
  selected: true,
  typemustmatch: true
}

const unencodedElements = {
  __proto__: null,
  style: true,
  script: true,
  xmp: true,
  iframe: true,
  noembed: true,
  noframes: true,
  plaintext: true,
  noscript: true
}

/*
  Format attributes
*/
function formatAttrs (attributes: any, opts: any) {
  if (!attributes) return

  let output = ''
  let value

  // Loop through the attributes
  for (let key in attributes) {
    value = attributes[key]
    if (output) {
      output += ' '
    }

    if (!value && booleanAttributes[key]) {
      output += key
    } else {
      output += key + '="' + (opts.decodeEntities ? entities.encodeXML(value) : value) + '"'
    }
  }

  return output
}

/*
  Self-enclosing tags (stolen from node-htmlparser)
*/
const singleTag = {
  __proto__: null,
  area: true,
  base: true,
  basefont: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  checkbox: false,
  input: false, // set false
  isindex: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
}

export function getOuterHTML (dom: any, opts?: any) {
  if (!Array.isArray(dom) && !dom.cheerio) dom = [dom]
  opts = opts || {}

  let output = ''

  for (let i = 0; i < dom.length; i++) {
    let elem = dom[i]

    if (elem.type === 'root') {
      output += getOuterHTML(elem.children, opts)
    } else if (ElementType.isTag(elem)) {
      output += renderTag(elem, opts)
    } else if (elem.type === ElementType.Directive) {
      output += renderDirective(elem)
    } else if (elem.type === ElementType.Comment) {
      output += renderComment(elem)
    } else if (elem.type === ElementType.CDATA) {
      output += renderCdata(elem)
    } else {
      output += renderText(elem, opts)
    }
  }

  return output
}

function renderTag (elem: any, opts: any) {
  // Handle SVG
  if (elem.name === 'svg') opts = {decodeEntities: opts.decodeEntities, xmlMode: true}

  let tag = '<' + elem.name
  let attribs = formatAttrs(elem.attribs, opts)

  if (attribs) {
    tag += ' ' + attribs
  }

  if (
    opts.xmlMode
    && (!elem.children || elem.children.length === 0)
  ) {
    tag += '/>'
  } else {
    tag += '>'
    if (elem.children) {
      tag += getOuterHTML(elem.children, opts)
    }

    if (!singleTag[elem.name] || opts.xmlMode) {
      tag += '</' + elem.name + '>'
    }
  }

  return tag
}

function renderDirective (elem: any) {
  return '<' + elem.data + '>'
}

function renderText (elem: any, opts: any) {
  let data = elem.data || ''

  // if entities weren't decoded, no need to encode them back
  if (opts.decodeEntities && !(elem.parent && elem.parent.name in unencodedElements)) {
    data = entities.encodeXML(data)
  }

  return data
}

function renderCdata (elem: any) {
  return '<![CDATA[' + elem.children[0].data + ']]>'
}

function renderComment (elem: any) {
  return '<!--' + elem.data + '-->'
}

export function getInnerHTML (elem: any, opts?: any) {
  return elem.children ? elem.children.map(function (elem: any) {
    return getOuterHTML(elem, opts)
  }).join('') : ''
}

export function getText (elem: any): string {
  if (Array.isArray(elem)) return elem.map(getText).join('')
  if (isTag(elem)) return elem.name === 'br' ? '\n' : getText(elem.children)
  if (elem.type === ElementType.CDATA) return getText(elem.children)
  if (elem.type === ElementType.Text) return elem.data
  return ''
}
