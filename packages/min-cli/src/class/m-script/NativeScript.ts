import * as babel from 'babel-core'
import { Request } from '../Request'
import { BaseScript } from './BaseScript'

export class NativeScript extends BaseScript {
  constructor (source: string, request: Request, options: BaseScript.Options) {
    super(source, request, options)
    this.initNode()
  }

  protected traverse () {
    let visitor: babel.Visitor = {
      Identifier: (path) => {
        this.visitDefine(path)
      },
      ImportDeclaration: (path) => {
        this.visitDepend(path)
      },
      CallExpression: (path) => {
        this.visitDepend(path)
      }
    }

    babel.traverse(this.node, visitor)
  }
}
