import * as babel from 'babel-core'
import * as traverse from 'babel-traverse'
import * as _ from 'lodash'
import { Request } from '../Request'
import { WxScript } from './WxScript'
import core from '@mindev/min-core'
import t = babel.types
import NodePath = traverse.NodePath

export class WxaScript extends WxScript {
  constructor (source: string, request: Request, options: WxScript.Options) {
    super(source, request, options)
    this.initNode()
  }

  traverse () {
    let visitor: babel.Visitor = {
      Identifier: (path) => {
        this.visitDefine(path)
      },
      ImportDeclaration: (path) => {
        this.visitDepend(path)
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
}

// private visitGlobalMin (path: NodePath<t.ObjectProperty>) {
//   let { node } = path
//   if (!node) return

//   let { key, value } = node
//   let keyField = core.util.getKeyOrValueFieldByExpression(key)

//   if (GLOBAL_MIN_KEY !== keyField) {
//     return undefined
//   }

//   if (!value || value.type !== 'ObjectExpression') {
//     return undefined
//   }

//   // { config: {}, mixins: []}
//   let { properties } = value

//   properties.forEach(prop => {

//     if (!t.isObjectProperty(prop)) return

//     // Get the key field name from globalMix.
//     let keyField = core.util.getKeyOrValueFieldByExpression(prop.key)

//     switch (keyField) {
//       case CONFIG_KEY:
//         extractConfig(prop)
//         break

//       case MIXINS_KEY:
//         extractMixins(prop)
//         break
//     }
//   })

//   _.merge(this.globalMin, GLOBAL_MIN)

//   path.remove()
// }

// Extract config from globalMix.
// function extractConfig (prop: t.ObjectProperty) {
//   let $config = core.util.getConfigObjectByNode(prop)
//   let { config } = this.globalMin

//   // Merge the config properties to globalMin.
//   _.merge(config, $config)
// }

// Extract mixins from globalMix.
// function extractMixins (prop: t.ObjectProperty) {

//   if (!t.isArrayExpression(prop.value)) {
//     core.util.warn('mixins 属性不是一个 ArrayExpression 类型')
//     return
//   }

//   // Register the list of elements for mixins.
//   let { elements } = prop.value
//   let { mixins } = this.globalMin

//   let $mixins = elements.map(elem => {
//     if (!t.isIdentifier(elem)) {
//       core.util.warn(`mixins 中包含非 Identifier 类型的元素`)
//       return
//     }
//     return elem.name
//   }).filter(elem => !!elem)

//   $mixins.forEach(mixin => mixins.push(mixin))
// }
