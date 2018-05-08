import * as babel from 'babel-core'
import { util } from '@mindev/min-core'

import t = babel.types

const htmlparser = require('htmlparser2')
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g

const { DomUtils } = htmlparser

export function getRenderExps (dom: any) {
  let filterExps = getGlobalFilterExps(dom)
  let tokens = parseDom(dom, filterExps)
  let exps = parseTokens(tokens)
  return exps
}

function parseDom (dom: any, filterExps = []) {
  let tokens = {}

  if (!dom) {
    return tokens
  }

  if (util.isArray(dom)) {
    dom = {
      children: dom
    }
  }

  let { type, name, data = '', attribs = {}, children = [], parent } = dom
  if (name === 'wxs') {
    return tokens
  }

  let text = ''
  if (type === 'tag') {
    text = util.values(attribs).join(' ')

    if (attribs['wx:for']) {
      filterExps = [
        ...filterExps,
        attribs['wx:for-index'] || 'index',
        attribs['wx:for-item'] || 'item'
      ]
    }
  } else if (type === 'text') {
    text = data.trim()
  }

  if (text !== '') {
    let res = parseText(text, filterExps)
    tokens = Object.assign({}, tokens, res.tokens)
  }

  children
    .map(item => parseDom(item, filterExps))
    .forEach(item => tokens = Object.assign({}, tokens, item))

  return tokens
}

function parseText (text, filterExps = []) {
  const tagRE = defaultTagRE
  const tokens = {}

  if (!tagRE.test(text)) {
    return { tokens }
  }

  let match
  tagRE.lastIndex = 0

  // tslint:disable
  while ((match = tagRE.exec(text))) {

    // [a.b, a.b.c, e.f, e.f[0]]
    const exps = parseAST(match[1].trim())

    exps.forEach(exp => {
      // filterExps => [a.b, e.f]
      const some = filterExps.some(filterExp => {
        if (filterExp === exp) { // a.b, e.f
          return true
        }

        // /^a\.b(\.|\[)/ => a.b.c
        // /^e\[f\](\.|\[)/ => e[f].c
        if (getExpReg(filterExp).test(exp)) {
          return true
        }
      })

      if (!some) {
        tokens[exp] = true
      }
    })
  }

  return { tokens }
}

function parseAST (exp: string) {
  let exps = []

  if (checkReserved(exp)){ // 0, 1 , ...9, false, true, null, undefined, 'abc', "abc"
    return exps
  }

  if (exp.indexOf('...') !== -1) { // {{...a}}, {{[...b]}}
    // TODO BUG
    // 1. {{a['...b']}} => {{a['b']}}
    // 2. {{...a['...b']}} => {{a['b']}}

    // {{...a}} => {{a}}
    // {{[...b]}} => {{[b]}}
    exp = exp.replace(/[\.]{3,3}([a-zA-Z]{1,})/g, '$1')
  }

  if(checkObjectExp(exp)) { // {{a:b, c:d}}
    exp = `({${exp}})` // ({a:b, c:d})
  } else if (/[^\w\.]/.test(exp)) { // not a-z、A-Z 0-9 . []
    exp = `{${exp}}` // {a, b},{a + b},{a ? b : c},{a > b},{'a'},{[1,2,3] + ''}
  } else {
    exps.push(exp)
    return exps // [a, a.b, a.b[1]]
  }

  let { ast: node } = babel.transform(exp, {
    ast: true,
    babelrc: false
  })

  babel.traverse(node, {
    Identifier (path) {
      let { parent } = path

      // {a:b}         => a is label
      // ({a, b})      => a、b same as key and value.
      // ({a:b, c:d})  => a、c is key
      if (path.key === 'label' || path.key === 'key') return

      // {a.b.c}       => Both b and c all Identifier
      // {a.b.c}       => Both b.parent and c.parent all MemberExpression
      if (t.isMemberExpression(parent)) {
        if (!parent.computed) {
          return
        }

        if (path.key !== 'property') {
          return
        }
      }

      // [a, b, d]
      exps.push(path.node.name)
    },

    MemberExpression (path) {
      if (t.isMemberExpression(path.parent) && path.key !== 'property') {
        return
      }

      let { node } = path
      let expression: t.Expression

      while (node) {
        let { computed, object, property } = node
        // a[b]、b.c[b+1]
        if (computed && !t.isStringLiteral(property) && !t.isNumericLiteral(property)) {

          if (t.isIdentifier(object)) {
            exps.push(object.name) // a
            expression = null
          } else if (t.isMemberExpression(object)) {
            expression = object // b.c
          } else {
            expression = null
          }

        } else {
          expression = expression || node

          if (!t.isIdentifier(object) && !t.isMemberExpression(object)) {
            expression = null
          }
        }

        node = t.isMemberExpression(object) ? object : null
      }

      if (!expression) {
        return
      }

      const program = t.program([
        t.expressionStatement(expression)
      ])

      let { code } = babel.transformFromAst(program, '', {
        code: true,
        ast: false,
        minified: true,
        babelrc: false
      })

      // code => a.b.c;
      if (code.lastIndexOf(';') !== -1) {

        // a.b.c; => a.b.c
        code = code.slice(0, code.length -1)
      }

      // list['length'] => list.length
      // obj['a1']['a2']['a3'] => obj.a1.a2.a3
      code = pathFormat(code)

      // ['a.b.c']
      exps.push(code)
    }

    // MemberExpression (path) {
    //   let { node, parent } = path
    //   // {a.b.c}       => Both b.parent and c.parent all MemberExpression
    //   if (t.isMemberExpression(parent)) {

    //     if (!parent.computed) { // a.b.c
    //       return
    //     } else if (t.isStringLiteral(parent.property) || t.isNumericLiteral(parent.property)) { // a.b['c'] a.b[0]
    //       return
    //     }
    //   }

    //   let expression: t.Expression
    //   let { computed, property } = node

    //   // a[b]、b.c[b+1]
    //   if (computed && !t.isStringLiteral(property) && !t.isNumericLiteral(property)) {
    //     if (t.isIdentifier(node.object)) {
    //       exps.push(node.object.name) // a
    //     } else {
    //       expression = node.object // b.c
    //     }

    //     // a[b]
    //     if (t.isIdentifier(property)) {
    //       exps.push(property.name) // b
    //     }
    //   } else { // a.b.c、a[1]、a['b']
    //     expression = node
    //   }

    //   if (!expression) {
    //     return
    //   }

    //   const program = t.program([
    //     t.expressionStatement(expression)
    //   ])

    //   let { code } = babel.transformFromAst(program, '', {
    //     code: true,
    //     ast: false,
    //     minified: true,
    //     babelrc: false
    //   })

    //   // code => a.b.c;
    //   if (code.lastIndexOf(';') !== -1) {
    //     code = code.slice(0, code.length -1)
    //   }
    //   console.log(code);
    //   // ['a.b.c']
    //   exps.push(code)
    // }
  })

  return exps
}

function parseTokens (tokens) {
  let exps = []

  if (util.isPlainObject(tokens)) {
    tokens = Object.keys(tokens)
  }

  if (!tokens.length) {
    return exps
  }

  let regexp
  // ['a.b', 'a.b.c', 'a.b[e]', , 'a.e', 'b[0]']
  tokens = tokens.sort().filter((token, index) => {
    if (index === 0) {
      exps.push(token) // a.b
      regexp = getExpReg(token)
      return
    }

    // a.b => /^a\.b(\.|\[)/
    // a[b] => /^a\[b\](\.|\[)/
    if (regexp.test(token)) { // a.b.c a.b[e]
      return
    }

    return true // a.e b[0]
  })

  exps = exps.concat(parseTokens(tokens))

  return exps
}

function getGlobalFilterExps (dom: any) {
  let filterExps: string[] = []

  if (!dom) {
    return filterExps
  }

  // <wxs module="name"></wxs>
  let wxsElems = DomUtils.getElementsByTagName('wxs', dom, true, [])

  // ['name']
  filterExps = wxsElems.map(elem => {
    let { attribs = {} } = elem

    if (attribs['module']) return attribs['module']
  })

  return filterExps
}

function checkObjectExp (exp) {
  // keep Identifier
  // remove StringLiteral
  // {{"item:"}} or {{'item?a:b'}} => {{''}}

  // exp = exp.replace(/"([^"]*)"/g, '').replace(/'([^']*)'/g, '')
  exp = exp.replace(/(['])[^']*\1/g, '').replace(/(["])[^"]*\1/g, '')

  // Compare two results to get an object expression.
  // :.length > ?.length
  return (exp.match(/\:/g) || []).length > (exp.match(/\?/g) || []).length
}

function checkReserved (exp) {
  // 10
  // 10.8
  if (/^[0-9][0-9.]*$/.test(exp)) {
    return true
  }

  // "abc"
  // 'abc: bcd'
  if (/^(['])[^']*\1$/.test(exp) && /^(["])[^"]*\1$/.test(exp)) {
    return true
  }

  if (['null', 'false', 'true', 'undefined'].indexOf(exp) !== -1) {
    return true
  }

  return false
}

function getExpReg (exp: string) {
  exp = exp.replace(/(\.|\[|\])/g,'\\$1')

  return new RegExp(`^${exp}(\\.|\\[)`)
}

function pathFormat (path) {
  // list[0] => list.0
  // path = path.replace(/\[([\d]+)\]/g, '.$1')

  // list['length']
  path = path.replace(/\[(['"])([^'"]*)\1\]/g, '.$2')

  return path
}
