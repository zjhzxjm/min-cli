import * as path from 'path'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as babel from 'babel-core'
import * as traverse from 'babel-traverse'
import * as changeCase from 'change-case'
import { Request } from '../Request'
import { WxScript } from './WxScript'
import util, { md, config, log, LogType, Global } from '../../util'
import core from '@mindev/min-core'
import t = babel.types
import NodePath = traverse.NodePath

const DATA_KEY = 'data'
const PATH_SEP = path.sep
const $path = path

export class WxpScript extends WxScript {
  constructor (source: string, request: Request, options: WxScript.Options) {
    super(source, request, options)
    this.initConfig()
    this.initNode()
    this.addWxcDepends()
  }

  afterSave (): void {
    this.saveConfigFile()
  }

  protected initConfig () {
    // The require path of the usingComponents is resolved.
    let resolvePath = (requirePath: string): string => {
      if (requirePath.charAt(0) !== '.') {
        return requirePath
      }

      // For example: ../../ + '../components/wxc-loading'
      return path.join(this.getRelativePathFromWxa(), requirePath)
    }

    let { usingComponents } = Global.layout.app

    usingComponents = _.forIn(_.cloneDeep(usingComponents), (value, key, object) => {
      object[key] = resolvePath(value)
    })

    this.config = _.merge({}, this.config, {
      usingComponents
    })
  }

  protected traverse () {
    let visitor: babel.Visitor = {
      Identifier: (path) => {
        this.visitDefine(path)
      },
      ImportDeclaration: (path) => {
        this.visitDepend(path)
      },
      VariableDeclarator: (path) => {
        this.visitRender(path)
      },
      CallExpression: (path) => {
        this.visitDepend(path)
      },
      ObjectExpression: (path) => {
        this.visitStructure(path)
      },
      ObjectProperty: (path) => {
        this.visitMarkdown(path)
        this.visitConfig(path)
      }
    }
    babel.traverse(this.node, visitor)
  }

  /**
   * babel.traverse 转换访问器方法，用于docs 和 demos 目录下文件md内容转换成 html 并写入到 data 属性 中
   *
   * @private
   * @param {NodePath<t.ObjectProperty>} path 节点路径
   * @memberof WxpScript
   */
  private visitMarkdown (path: NodePath<t.ObjectProperty>) {
    let { key, value } = path.node
    let dataKey = ''
    if (t.isIdentifier(key)) {
      dataKey = key.name
    } else if (t.isStringLiteral(key)) {
      dataKey = key.value
    }

    if (DATA_KEY !== dataKey) {
      return
    }

    if (!value) {
      log.warn('data 属性没有值')
      return
    }
    if (!t.isObjectExpression(value)) {
      log.warn('data 属性不是一个ObjectExpression')
      return
    }

    let properties: Array<t.ObjectProperty> = []
    // [['src', 'pages'], ['abnor', 'index.wxp']] => ['src', 'pages', 'abnor', 'index.wxp'] => 'src\/pages\/abnor\/index.wxp'
    let pattern = Array.prototype.concat.apply([], [config.pages.split('/'), ['([a-z-]+)', `index${config.ext.wxp}`]]).join(`\\${PATH_SEP}`)

    // src/pages/abnor/index.wxp => ['src/pages/abnor/index.wxp', 'abnor']
    let matchs = this.request.srcRelative.match(new RegExp(`^${pattern}$`))
    if (!matchs || matchs.length < 2) {
      return
    }

    // abnor => wxc-abnor
    let pkgDirName = `${config.prefixStr}${matchs[1]}`
    // ~/you_project_path/src/packages/wxc-abnor/README.md
    let readmeFile = config.getPath('packages', pkgDirName, 'README.md')

    properties.push(
      t.objectProperty(
        t.identifier('readme'), // readme
        t.stringLiteral(this.md2htmlFromFile(readmeFile))
      )
    )

    // let docIntroFile = 'docs/intro.md'
    // let docApiFile = 'docs/api.md'
    // let docChangeLogFile = 'docs/changelog.md'

    // properties.push(
    //   t.objectProperty(
    //     t.identifier('docIntro'), // docIntro
    //     t.stringLiteral(this.md2htmlFromFile(docIntroFile)) // <h1></h1>
    //   )
    // )
    // properties.push(
    //   t.objectProperty(
    //     t.identifier('docApi'), // docApi
    //     t.stringLiteral(this.md2htmlFromFile(docApiFile))
    //   )
    // )
    // properties.push(
    //   t.objectProperty(
    //     t.identifier('docChangeLog'), // docChangeLog
    //     t.stringLiteral(this.md2htmlFromFile(docChangeLogFile))
    //   )
    // )

    // 前提条件，需要将config字段写在js模块最前面
    let { usingComponents = {} } = this.config

    _.forIn(usingComponents, (value, key) => {
      if (!/^demo-/.test(key)) {
        return
      }

      let file = `${value}${config.ext.wxc}`
      properties.push(
        t.objectProperty(
          t.identifier(changeCase.camelCase(key)), // demoDefault
          t.stringLiteral(this.md2htmlFromFile(file)) // <template><wxc-hello></wxc-hello><template>
        )
      )
    })

    // let dependWxcs = this.depends.filter(depend => {
    //   return depend.requestType === RequestType.WXC && /^demo-/.test(depend.usingKey)
    // })

    // _.forEach(dependWxcs, (dependWxc: Depend.Wxc, index) => {
    //   let name = dependWxc.usingKey
    //   let file = `${dependWxc.request}${config.ext.wxc}`
    //   properties.push(
    //     t.objectProperty(
    //       t.identifier(changeCase.camelCase(name)), // demoDefault
    //       t.stringLiteral(this.md2htmlFromFile(file)) // <template><wxc-hello></wxc-hello><template>
    //     )
    //   )
    // })

    let mdObjectProperty = t.objectProperty(
      t.stringLiteral('__code__'),
      t.objectExpression(properties)
    )

    value.properties = [mdObjectProperty, ...value.properties]
  }

  private getRelativePathFromWxa (): string {
    let { request: appRequest } = Global.layout.app
    let { src: appFilePath } = appRequest
    let { src: curFilePath } = this.request

    // The relative path from the current file to the app file.
    // For example:
    // from ~/src/pages/home/index.wxp
    // to   ~/src/app.wxa

    let from = $path.dirname(this.options.referenceSrc || curFilePath)
    let to = $path.dirname(appFilePath)

    return $path.relative(from, to)
  }

  /**
   * 将文件的MD内容转换成HTML
   *
   * @private
   * @param {string} file 文件地址
   * @returns
   * @memberof WxpScript
   */
  private md2htmlFromFile (file: string) {
    if (!path.isAbsolute(file)) {
      file = path.join(path.dirname(this.request.src), file)
    }
    if (fs.existsSync(file)) {
      let source = fs.readFileSync(file, 'utf-8')
      let isWxc = path.extname(file) === config.ext.wxc
      if (isWxc) {
        source = '``` html\n' + source + '\n```'
      }
      return `${md.md2html(source, isWxc)}`
    }
    return ''
  }
}

// /**
//  * Create or attach the mixins declaration.
//  * For WXP
//  *
//  * @private
//  * @param {NodePath<t.Program>} path
//  * @memberof WxpScript
//  */
// private createMixinsDeclaration (path: NodePath<t.Program>) {
//   let { node: { body } } = path

//   // For import Declaration
//   // Example:
//   // 1. import mixin from 'mixins/xxx'
//   // 2. import { mixin1, mixin2 } from 'mixins/xxx'
//   let importDecl = (mixin: string, decl: t.ImportDeclaration) => {

//     // specifiers => [mixin, mixin1, mixin2]
//     // source => mixins/xxx
//     let { specifiers, source } = decl

//     // Find a name that is the same as specifiers.
//     let spe = specifiers.find(spe => {
//       let { local: { name } } = spe
//       return name === mixin
//     })

//     if (!spe) return

//     let newSpecifiers = [spe]
//     let newSource = resolvePath(source.value)
//     let newImportDeclaration = t.importDeclaration(newSpecifiers, newSource)

//     // Insert the top of the body.
//     body.unshift(newImportDeclaration)
//   }

//   // For require Declaration
//   // Example:
//   // 1. const mixn = require('mixins/xxx')
//   // 2. const { mixin1, mixin2 } = require('mixins/xxx')
//   // 3. const { mixin2: mixin22 } = require('mixins/xxx')
//   let requireDecl = (mixin: string, decl: t.VariableDeclarator) => {
//     let { id, init } = decl

//     if (!t.isCallExpression(init)) return
//     if (!init.arguments.length) return

//     // Get first argument，Ignore other arguments
//     // For example: 'mixins/xxx'
//     let fistArgument = init.arguments[0]

//     if (!t.isStringLiteral(fistArgument)) return

//     let newDeclarations = []

//     // Get the resolved require path.
//     // For example: ['~/mixins/xxx']
//     let newArguments = [resolvePath(fistArgument.value)]
//     // For example: require('~/mixns/xxx')
//     let newInit = t.callExpression(init.callee, newArguments)

//     // ①
//     // For example:
//     // id => { mixin1 }
//     // id => { mixin2: mixin22 }
//     if (t.isObjectPattern(id)) {
//       let { properties } = id

//       // Find a name that is the same a properties.
//       let prop = properties.find(prop => {
//         if (!t.isObjectProperty(prop)) return false

//         // Get mixin22 from { mixin2: mixin22 }
//         let valueField = core.util.getKeyOrValueFieldByExpression(prop.value)
//         return valueField === mixin
//       })

//       if (!prop) return

//       // Create an objectPattern
//       let newId = t.objectPattern([prop])
//       newDeclarations = [t.variableDeclarator(newId, newInit)]
//     }

//     // ②
//     // For example:
//     // id => mixin
//     if (t.isIdentifier(id) && id.name === mixin) {
//       // Use the original id
//       let newId = id
//       newDeclarations = [t.variableDeclarator(newId, newInit)]
//     }

//     if (newDeclarations.length === 0) return

//     let newVariableDeclaration = t.variableDeclaration('const', newDeclarations)

//     // Insert the top of the body.
//     body.unshift(newVariableDeclaration)
//   }

//   // The require path of the mixins is resolved.
//   let resolvePath = (requirePath: string): t.StringLiteral => {
//     if (requirePath.charAt(0) === '.') {
//       // For example: ../../ + './mixins/index.js'
//       requirePath = $path.join(this.getRelativePathFromWxa(), requirePath)
//     }
//     return t.stringLiteral(requirePath)
//   }

//   let { globalMin } = Global.layout.app
//   let { mixins, dependDeclaration } = globalMin

//   mixins.forEach(mixin => {
//     dependDeclaration.forEach(decl => {
//       if (t.isImportDeclaration(decl)) {

//         importDecl(mixin, decl)
//       }

//       if (t.isVariableDeclarator(decl)) {

//         requireDecl(mixin, decl)
//       }
//     })
//   })
// }

// /**
//   * Create or attach the mixins properties.
//   * For WXP
//   *
//   * @private
//   * @param {t.ObjectExpression} arg
//   * @memberof WxpScript
//   */
// private addMixinsProperty (properties: Array<t.ObjectProperty | t.ObjectMethod | t.SpreadProperty>) {

//   // Get the mixins properties.
//   let prop = properties.find(prop => {
//     if (!t.isObjectProperty(prop)) return false

//     let keyField = core.util.getKeyOrValueFieldByExpression(prop.key)

//     if (keyField === MIXINS_KEY) return true
//   })

//   let { mixins } = Global.layout.app.globalMin

//   // Create an arrayExpression.
//   // For example：[mixin1, mixin2]
//   let arrExp = t.arrayExpression(mixins.map(mixin => {
//     return t.identifier(mixin)
//   }))

//   // The mixins property already exists.
//   if (prop && t.isObjectProperty(prop)) {
//     let { value } = prop
//     if (!t.isArrayExpression(value)) return

//     // Extend the new value from the existing mixins attribute.
//     // For example：[newMixin1, newMixin2, oldMixin1, oldMixin2]
//     value.elements = [
//       ...arrExp.elements,
//       ...value.elements
//     ]
//   } else {
//     // Create a mixins attribute.
//     // For example：{mixins: [mixin1, mixin2]}
//     prop = t.objectProperty(t.identifier(MIXINS_KEY), arrExp)
//     properties.push(prop)
//   }
// }
