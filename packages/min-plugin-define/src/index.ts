import * as _ from 'lodash'
import * as t from 'babel-types'
import { PluginHelper } from '@mindev/min-core'

const DEFAULTS: DefinePlugin.Options = {
  config: {
    // PRODUCTION: true
  },
  // filter: new RegExp('\.(js)$'),
  validate (options: PluginHelper.Options) {
    return true
  }
}

export namespace DefinePlugin {
  export interface Config {
    [key: string]: string | RegExp | Function
  }

  export interface Options {
    config: Config
    // filter: RegExp
    validate (options: PluginHelper.Options): boolean
  }
}

export default class DefinePlugin extends PluginHelper.AstPlugin {

  constructor (public options: DefinePlugin.Options) {
    super('DefinePlugin')

    this.options = {
      ...DEFAULTS,
      ...this.options
    }
  }

  apply (options: PluginHelper.Options): Promise<PluginHelper.Options> {
    let { validate } = this.options
    let { filename, extend = {} } = options
    let { ast: node = null } = extend
    let p = Promise.resolve(options)

    // if (_.isRegExp(filter) && !filter.test(filename)) {
    //   return p
    // }

    if (_.isFunction(validate) && !validate(options)) {
      return p
    }

    if (!node || !t.isIdentifier(node)) {
      return p
    }

    // output('变更', filename)

    try {
      let definition = this.getDefinition()

      for (const key in definition) {
        if (key === node.name) {
          node.name = definition[key]
        }
      }

      _.merge(options, { extend: { ast: node } })
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }

  private getDefinition () {
    let { config } = this.options
    let definition: {
      [key: string]: string
    } = {}

    for (let key in config) {
      // value
      let code = config[key]
      if (code && typeof code === 'object' && !(code instanceof RegExp)) {
        // PRODUCTION: {env: 'dev'}
        // this.getDefinition(code)
        definition[key] = this.stringifyObj(code)
      }
      else {
        definition[key] = this.toCode(code)
      }
    }
    return definition
  }

  private toCode (code: string | RegExp | Function): string {
    if (code === null) return 'null'
    else if (code === undefined) return 'undefined'
    else if (code instanceof RegExp && code.toString) return code.toString()
    else if (typeof code === 'function' && code.toString) return '(' + code.toString() + ')'
    else if (typeof code === 'object') return this.stringifyObj(code)
    else return code + ''
  }
  /*
  * 输入： {a: 1, b: 'name'}
  * 输出："Object({"a":1, "b": name})"
  * */
  private stringifyObj (obj: any): string {
    return (
      'Object({' +
      Object.keys(obj)
        .map(key => {
          const code = obj[key]
          return JSON.stringify(key) + ':' + this.toCode(code)
        })
        .join(',') +
      '})'
    )
  }
}
