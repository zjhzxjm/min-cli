import * as path from 'path'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as changeCase from 'change-case'
import * as babel from 'babel-core'
import * as traverse from 'babel-traverse'
import { Depend } from '../Depend'
import { Request } from '../Request'
import { WxSFM } from '../WxSFM'
import { RequestType } from '../../declare'
import util, { config, Global } from '../../util'
import core, { loader, PluginHelper } from '@mindev/min-core'

import t = babel.types
import NodePath = traverse.NodePath

export namespace BaseScript {

  /**
   * 选项
   *
   * @export
   * @interface Options
   */
  export interface Options {

    /**
     * 预编译语言
     *
     * @type {string}
     * @memberof Options
     */
    lang: string,

    /**
     * 当前模块所在的引用路径
     *
     * @type {string}
     * @memberof Options
     */
    referenceSrc?: string
  }

  /**
   * config 配置，script中的一部分，与.json文件一样 （组件、页面、应用）
   *
   * @export
   * @interface Config
   */
  export interface Config {
    component?: boolean
    usingComponents?: UsingComponents,
    [name: string]: any
  }

  /**
   * 引用wxc组件集合
   *
   * @export
   * @interface UsingComponents
   */
  export interface UsingComponents {
    [key: string]: string
  }
}

/**
 * SCRIPT 模块类
 *
 * @export
 * @class BaseScript
 * @extends {WxSFM}
 */
export class BaseScript extends WxSFM {
  protected node: t.Node
  protected config: BaseScript.Config = Object.create(null)
  protected depends: Depend[] = []
  // protected dependDeclaration: (t.ImportDeclaration | t.VariableDeclarator)[] = []
  protected renderDeclarator: t.VariableDeclarator = null

  /**
   * Creates an instance of BaseScript.
   * @param {string} source
   * @param {Request} request
   * @param {BaseScript.Options} options
   * @memberof BaseScript
   */
  constructor (source: string, request: Request, public options: BaseScript.Options) {
    super(source, request, {
      destExt: request.ext === config.ext.wxs ? config.ext.wxs : config.ext.js,
      referenceSrc: options.referenceSrc
    })
  }

  /**
   * 返回 wxa wxp wxa 单文件中 script 模块的 config 属性
   *
   * @returns
   * @memberof BaseScript
   */
  getConfig () {
    return this.config
  }

  /**
   * 返回 wxa wxp wxa 单文件中 script 模块所引用的 wxc 组件
   *
   * @returns
   * @memberof BaseScript
   */
  getUsingComponents () {
    return this.config.usingComponents || {}
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof BaseScript
   */
  getDepends (): Depend[] {
    return this.depends
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof BaseScript
   */
  updateDepends (useRequests: Request.Core[]): void {
    let depends = this.getDepends()

    useRequests.forEach(useRequest => {

      depends
      .filter(depend => {
        return depend.requestType === useRequest.requestType && depend.request === useRequest.request
      })
      .forEach(depend => {
        let request = ''
        request = path.relative(path.dirname(this.dest), path.dirname(useRequest.dest))
        request = path.join(request, path.basename(useRequest.dest, useRequest.ext))
        request = request.charAt(0) !== '.' ? `./${request}` : request
        request = request.split(path.sep).join('/')

        switch (depend.requestType) {
          case RequestType.SCRIPT:
            depend.$node.value = request + config.ext.js
            break

          case RequestType.JSON:
            // *.json => *.json.js
            depend.$node.value = request + useRequest.ext + config.ext.js
            break

          case RequestType.WXS:
            if (depend.$node) {
              depend.$node.value = request + useRequest.ext
            }
            break

          case RequestType.WXC:
          case RequestType.WXP:
            this.config.usingComponents = Object.assign(this.config.usingComponents || {}, {
              [depend.usingKey]: request
            })
            break
        }
      })
    })
  }

  /**
   * 将 AST 节点树生成 code 代码
   *
   * @returns {string}
   * @memberof BaseScript
   */
  async generator (): Promise<string> {
    if (!this.node) {
      return ''
    }

    let { lang = 'babel' } = this.options
    let { isThreeNpm, ext } = this.request

    if (lang === 'ts') {
      lang = 'typescript'
    }

    if (lang === 'js') {
      lang = 'babel'
    }

    if (isThreeNpm || lang === 'typescript') {
      let result = babel.transformFromAst(this.node, this.source, {
        ast: false,
        babelrc: false,
        sourceMaps: process.env.NODE_ENV === 'production' ? false : 'inline',
        filename: this.request.src
      })
      return result.code || ''
    }

    let compilerConfig = config.compilers[lang]

    if (lang === 'babel' && ext === config.ext.wxs && _.isPlainObject(compilerConfig)) {
      compilerConfig = _.omit(compilerConfig, 'sourceMaps')
    }

    let compiler = loader.loadCompiler(lang)

    if (!compiler) {
      throw new Error(`未发现相关 ${lang} 编译器配置，请检查min.config.js文件或尝试运行命令 "npm install @mindev/min-compiler-${lang} --save-dev" 进行安装.`)
    }

    if (!compiler.sync) {
      throw new Error(`未找到 ${lang} 编译器提供的 sync 同步方法，Min 不支持此编译器 @mindev/min-compiler-${lang}.`)
    }

    let result = compiler.sync({
      cwd: config.cwd,
      filename: this.request.src,
      config: compilerConfig,
      extend: {
        ast: this.node,
        code: this.source
      }
    })

    let {
      extend: {
        code = ''
      } = {}
    } = result

    return code
  }

  protected initNode () {
    let { source } = this
    let { lang = 'babel' } = this.options

    if (!source) {
      return
    }

    if (lang === 'ts') {
      lang = 'typescript'
    }

    if (lang === 'typescript') {
      let compiler = loader.loadCompiler(lang)

      if (!compiler) {
        throw new Error(`未发现相关 ${lang} 编译器配置，请检查min.config.js文件或尝试运行命令 "npm install @mindev/min-compiler-${lang} --save-dev" 进行安装.`)
      }

      if (!compiler.sync) {
        throw new Error(`未找到 ${lang} 编译器提供的 sync 同步方法，Min 不支持此编译器 @mindev/min-compiler-${lang}.`)
      }

      let result = compiler.sync({
        cwd: config.cwd,
        filename: this.request.src,
        config: config.compilers[lang] || {},
        extend: {
          code: this.source
        }
      })
      source = result.extend.code
    }

    let babelConfig = lang === 'babel'
      ? config.compilers['babel'] || {}
      : {}
    let { plugins = [] } = babelConfig

    // Support for extension operators.
    const usePlugins = [
      'transform-class-properties',
      'transform-object-rest-spread'
    ]
    plugins = plugins.filter((plugin: string | any[]) => {
      let name = ''
      if (core.util.isArray(plugin)) {
        name = plugin[0] as string
      } else {
        name = plugin
      }
      return usePlugins.indexOf(name) > -1
    })

    let result = babel.transform(source, {
      ast: true,
      babelrc: false,
      plugins
    })

    let { ast = t.emptyStatement() } = result
    this.node = ast

    this.traverse()
  }

  protected traverse () {
    //
  }

  protected addNativeDepends ($node: t.StringLiteral) {
    let request = $node.value
    let isJsonExt = path.extname(request) === config.ext.json
    let isWxsExt = path.extname(request) === config.ext.wxs

    if (isJsonExt) {
      this.depends.push({
        parent: this.dependParent,
        request,
        requestType: RequestType.JSON,
        $node
      })
    } else if (isWxsExt) {
      this.depends.push({
        parent: this.dependParent,
        request,
        requestType: RequestType.WXS,
        $node
      })
    } else {
      let isVirtual = !!config.resolveVirtual[request]
      this.depends.push({
        parent: this.dependParent,
        request,
        requestType: RequestType.SCRIPT,
        $node,
        isVirtual
      })
    }
  }

  protected visitDefine (path: NodePath<t.Identifier>) {
    let plugin = new PluginHelper(PluginHelper.Type.Ast, 'define')

    plugin.apply({
      cwd: config.cwd,
      filename: null,
      extend: {
        ast: path.node
      }
    })
  }

  /**
   * babel.traverse 转换访问器方法，用于将import 或 require 依赖的路径提取到 this.depends 中
   *
   * @private
   * @param {(NodePath<t.ImportDeclaration | t.CallExpression>)} path 节点路径
   * @memberof BaseScript
   */
  protected visitDepend (path: NodePath<t.ImportDeclaration | t.CallExpression>) {
    // Extract import declaration
    let extractImport = (node: t.ImportDeclaration): Boolean => {
      let { source: $node } = node

      // Add a dependency.
      this.addNativeDepends($node)

      return true
    }

    // Extract require declaration
    let extractRequire = (node: t.CallExpression): Boolean => {
      let { callee, arguments: args } = node

      // It must be the require function, with parameters.
      if (!(t.isIdentifier(callee) && callee.name === 'require' && args.length > 0)) {
        return false
      }

      // For example, from the first parameter of require('xxx').
      let $node = args[0]

      // Must be a string type.
      if (!t.isStringLiteral($node)) return false

      // Add a dependency.
      this.addNativeDepends($node)

      return true
    }

    // Add depend declaration
    // let addDependDeclaration = () => {
    //   let { node, parent } = path
    //   let $node = null

    //   if (t.isImportDeclaration(node)) {
    //     $node = node
    //   }

    //   if (t.isCallExpression(node) && t.isVariableDeclarator(parent)) {
    //     $node = parent
    //   }

    //   if (!$node) return

    //   // Add a request declaration
    //   this.dependDeclaration.push($node)
    // }

    let { node } = path

    // For import
    if (t.isImportDeclaration(node)) {
      let isContinue = extractImport(node)

      if (!isContinue) return

      // Add request declaration
      // addDependDeclaration()
      return
    }

    // For require
    if (t.isCallExpression(node)) {
      let isContinue = extractRequire(node)

      if (!isContinue) return

      // Add request declaration
      // addDependDeclaration()
      return
    }
  }
}

// private addRenderExpsProperty (properties: Array<t.ObjectProperty | t.ObjectMethod | t.SpreadProperty>, renderExps: string[]) {
//   // Create an arrayExpression.
//   // For example：['a', 'a.b', 'a[1]']
//   let arrExp = t.arrayExpression(renderExps.map(exp => {
//     return t.stringLiteral(exp)
//   }))

//   // Create a _renderExps attribute.
//   // For example：_renderExps: ['a', 'a.b', 'a[1]']
//   let prop = t.objectProperty(t.identifier('_renderExps'), arrExp)
//   properties.push(prop)
// }

// protected visitMinPage (path: NodePath<t.CallExpression>) {
//   if (!this.isWxp && !this.isWxc) return

//   let { node: { callee, arguments: args } } = path
//   if (!t.isIdentifier(callee)) return
//   if (!args || args.length === 0) return

//   // For Example：
//   // object.name is min
//   // property.name is Page
//   // let { object, property } = callee
//   // if (!t.isIdentifier(object) || !t.isIdentifier(property)) return

//   // let caller = `${object.name}.${property.name}`
//   // The mixins function is valid only in min.Page.

//   let caller = callee.name
//   if (caller !== 'Page' && caller !== 'Component') return

//   let arg = args[0]
//   // The first argument must be the ObjectExpression.
//   if (!t.isObjectExpression(arg)) return

//   let { properties } = arg

//   if (this.isWxp) {
//     this.addMixinsProperty(properties)
//   }

//   this._MinPageProperties = properties
// }

// 设置 config 的 usingComponents 的属性
  // private setConfigUsing (propKey: string, propValue: t.Expression) {
  //   if (propKey !== USING_KEY)
  //     return

  //   if (!this.isWxc && !this.isWxp)
  //     return

  //   if (!t.isObjectExpression(propValue)) {
  //     log.warn('config.usingComponents 属性不是一个ObjectExpression')
  //     return
  //   }

  //   // {'value': {'properties': [{'wx-loading': '@scope/wxc-loading'}]}}
  //   propValue.properties.forEach(prop => {
  //     // key   => 'wxc-loading'
  //     // value => '@scope/wxc-loading'
  //     if (!t.isObjectProperty(prop))
  //       return

  //     let key = ''
  //     let value = ''
  //     if (t.isStringLiteral(prop.key)) { // 'wxc-loading'
  //       key = prop.key.value
  //     } else if (t.isIdentifier(prop.key)) { // loading
  //       key = prop.key.name
  //     }

  //     if (t.isStringLiteral(prop.value)) { // '@scope/wxc-loading'
  //       value = prop.value.value
  //     }

  //     if (!key || !value)
  //       return

  //     this.config.usingComponents = this.config.usingComponents || {}
  //     // key   => 'wxc-loading'
  //     // value => '@scope/wxc-loading'
  //     this.config.usingComponents[key] = value

  //     // 'wxc-loading' => '@scope/wxc-loading'
  //     this.depends.push({
  //       request: value,
  //       requestType: RequestType.WXC,
  //       usingKey: key
  //     })
  //   })
  // }

  // 设置 config 的属性
  // private setConfigProp (propKey: string, propValue: t.Expression) {
  //   if (propKey === USING_KEY)
  //     return

  //   let key = propKey
  //   let value: string | boolean | undefined = undefined
  //   if (t.isStringLiteral(propValue)) { // 'Title'
  //     value = propValue.value
  //   } else if (t.isIdentifier(propValue)) { // 100
  //     value = propValue.name
  //   } else if (t.isBooleanLiteral(propValue)) { // true
  //     value = propValue.value
  //   }
  //   if (_.isUndefined(value))
  //     return

  //   this.config[key] = value
  // }
