import * as babel from 'babel-core'
import * as traverse from 'babel-traverse'
import { Request } from '../Request'
import { WxScript } from './WxScript'
import t = babel.types
import NodePath = traverse.NodePath

export class WxcScript extends WxScript {
  constructor (source: string, request: Request, options: WxScript.Options) {
    super(source, request, options)
    this.initConfig()
    this.initNode()
    this.addWxcDepends()
  }

  initConfig () {
    this.config.component = true
  }

  traverse () {
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
        this.visitConfig(path)
      }
    }
    babel.traverse(this.node, visitor)
  }

  afterSave (): void {
    this.saveConfigFile()
  }
}
