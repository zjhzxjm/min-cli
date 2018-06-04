import * as path from 'path'
import * as _ from 'lodash'
import * as babel from 'babel-core'
import * as traverse from 'babel-traverse'
import { Depend } from '../Depend'
import { Request } from '../Request'
import { BaseScript } from './BaseScript'
import { RequestType } from '../../declare'
import util, { config, log, LogType } from '../../util'
import core from '@mindev/min-core'

import t = babel.types
import NodePath = traverse.NodePath

export namespace WxScript {
  export interface Options extends BaseScript.Options {

  }
}

export class WxScript extends BaseScript {
  protected renderDeclarator: t.VariableDeclarator = null

  /**
   * Creates an instance of WxScript.
   * @param {string} source
   * @param {Request} request
   * @param {WxScript.Options} options
   * @memberof WxScript
   */
  constructor (source: string, request: Request, options: WxScript.Options) {
    super(source, request, options)
    this.initSource()
  }

  setRenderExps (renderExps: string[]) {
    if (!this.renderDeclarator) return

    let arrExp = t.arrayExpression(renderExps.map(exp => {
      return t.stringLiteral(exp)
    }))

    this.renderDeclarator.init = arrExp
  }

  protected initSource () {
    this.source = [
      `
        import * as __Min__ from '@minlib/min';
        // const __Min__ = require('@minlib/min');
        const __RenderExps__ = [];
      `,
      this.source
    ].join('\n')
  }

  /**
   * 添加WXC依赖
   *
   * @protected
   * @param {WxScript.UsingComponents} [usingComponents]
   * @memberof WxScript
   */
  protected addWxcDepends () {

    let { usingComponents = {} } = this.config

    _.forIn(usingComponents, (value, key) => {
      this.depends.push({ // 'wxc-loading' => '@scope/wxc-loading'
        parent: this.dependParent,
        request: value,
        requestType: RequestType.WXC,
        usingKey: key
      })
    })
  }

  /**
   * 将 wxp wxa 单文件中 script 模块的 config 属性值提取并过滤 并保存到 file.json 中
   *
   * @private
   * @memberof WxScript
   */
  protected saveConfigFile () {
    let dester = this.getDester(config.ext.json)
    log.msg(LogType.WRITE, dester.destRelative)
    util.writeFile(dester.dest, JSON.stringify(this.config, null, 2))
  }

  /**
   * babel.traverse 转换访问器方法，用于设置 this.config 配置对象
   *
   * @protected
   * @param {NodePath<t.ObjectProperty>} path
   * @memberof WxScript
   */
  protected visitConfig (path: NodePath<t.ObjectProperty>) {
    if (!this.isSFC) return

    let { node, parent } = path
    let $config = core.util.getConfigObjectByNode(node)

    if (!$config) return

    this.config = _.merge({}, this.config, $config)

    path.remove()
  }

  protected visitRender (path: NodePath<t.VariableDeclarator>) {
    if (!this.isSFC) return

    let { id } = path.node

    // const __RenderExps__ = []
    if (t.isIdentifier(id) && id.name === '__RenderExps__') {
      this.renderDeclarator = path.node
    }
  }

  protected visitStructure (path: NodePath<t.ObjectExpression>) {
    if (!this.isSFC) return

    // export default {...} => export default Component({...})
    // export default {...} => export default Page({...})
    // export default {...} => export default App({...})

    // module.exports = {...} => export default App({...})

    if (!checkUseExportDefault(path) && !checkUseModuleExports(path)) {
      return
    }

    // .wxc => wxc => Component
    // .wxp => wxc => Page
    // .wxa => wxa => App
    let extKey = _.findKey(config.ext, (ext) => ext === this.request.ext) || ''
    let structure = config.structure[extKey]
    if (!structure) {
      core.util.warn('没找到构造器')
      return
    }

    // __Min__.Page(options, extends)
    path.replaceWith(t.callExpression(
      t.identifier(`__Min__.${structure}`), // __Min__.Page
      [
        t.objectExpression(path.node.properties), // options => {...}
        t.objectExpression([ // extends => {renderExps: __RenderExps__}
          t.objectProperty(t.identifier('renderExps'), t.identifier('__RenderExps__'))
        ])
      ]
    ))
  }
}

function checkUseModuleExports (path: NodePath<t.ObjectExpression>): boolean {

  // the parent is module.exports = {}; exports.default = {}
  if (!t.isAssignmentExpression(path.parent)) {
    return false
  }

  let { left, operator } = path.parent

  if (operator !== '=') {
    return false
  }

  // left => module.exports or exports.default
  // operator => =
  // right => { ... }
  if (!t.isMemberExpression(left)) {
    return false
  }

  if (!t.isIdentifier(left.object) || !t.isIdentifier(left.property)) {
    return false
  }

  let expression = `${left.object.name}.${left.property.name}`
  if (expression !== 'module.exports' && expression !== 'exports.default') {
    return false
  }

  return true
}

function checkUseExportDefault (path: NodePath<t.ObjectExpression>): boolean {

  // the parent is export default
  if (!t.isExportDefaultDeclaration(path.parent)) {
    return false
  }

  return true
}
