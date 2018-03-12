import { DEFAULTS } from './const'
import t from 'babel-types'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import PluginUseway = PluginHelper.Useway
import Options = PluginDefine.Options

export default class PluginDefine implements Plugin {
  useway = PluginUseway.alone

  constructor (public options: Options) {
    // {
    //    PRODUCTION: Json.stringify(true)
    // }
    this.options = {...DEFAULTS, ...this.options}
  }

  apply (pluginOptions: PluginOptions, node: t.identifier) {
    // let { filter, config } = this.options
    // let { filename, content, output } = pluginOptions

    // if (!filter.test(filename)) {
    //   return Promise.resolve(content)
    // }
    let definition = this.getDefinition()

    let keys = Object.keys(definition)
    keys.forEach(k => {
      if (k === node.name && t.isIdentifier(node)) {
        node.name = definition[k]
      }
    })
  }

  private getDefinition () {
    let options = this.options
    let definition = {}
    Object.keys(options).forEach(key => {
      // value
      const code = options[key]
      if (code && typeof code === 'object' && !(code instanceof RegExp)) {
        this.getDefinition(code)
        this.stringifyObj(code)
        return
      }
      definition[key] = this.toCode(code)
    })
    return definition
  }
  private toCode (code) {
    if (code === null) return 'null'
    else if (code === undefined) return 'undefined'
    else if (code instanceof RegExp && code.toString) return code.toString()
    else if (typeof code === 'function' && code.toString) return '(' + code.toString() + ')'
    else if (typeof code === 'object') return stringifyObj(code)
    else return code + ''
  }
  /*
  * 输入： {a: 1, b: 'name'}
  * 输出："Object({"a":1, "b": name})"
  * */
  private stringifyObj (obj) {
    return (
      'Object({' +
      Object.keys(obj)
        .map(key => {
          const code = obj[key]
          return JSON.stringify(key) + ':' + toCode(code)
        })
        .join(',') +
      '})'
    )
  }
}

