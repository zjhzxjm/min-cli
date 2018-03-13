import * as path from 'path'
import * as _ from 'lodash'
import { log } from '../util'
const Module = require('module')

let relativeModules = {}
let requiredModules = {}
let loadedPlugins: Plugin[] = []

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options

export class PluginHelper {
  constructor (public options: PluginOptions, public useway: string) {
    this.applyPlugin(0, options)
  }
  async applyPlugin (index: number, options: PluginOptions) {
    let plugin = loadedPlugins[index]
    let { done } = options

    if (!plugin || plugin.useway !== this.useway) {
      done(options)
    } else {
      let code = await plugin.apply(options)
      let nextOptions = Object.assign({}, options, {
        code
      })
      await this.applyPlugin(index + 1, nextOptions)
    }
  }
}

export const loader = {
  lackList: [],

  noCompileLangs: ['wxml', 'xml', 'css', 'js'],

  getCompilerName (lang) {
    let prefix = '@mindev/min-compiler'
    if (lang.indexOf(prefix) === 0) {
      return lang
    }
    return `${prefix}-${lang}`
  },

  getPluginName (pluginName) {
    let prefix = '@mindev/min-plugin'
    if (pluginName.indexOf(prefix) === 0) {
      return pluginName
    }
    return `${prefix}-${pluginName}`
  },

  getNodeModulePath (moduleName, relative = process.cwd()) {
    if (typeof Module === 'object') {
      return null
    }

    let relativeMod = relativeModules[relative]
    let paths = []

    if (!relativeMod) {
      let filename = path.join(relative, './')

      relativeMod = new Module(filename)
      relativeMod.id = filename
      relativeMod.filename = filename
      // TODO
      // relativeMod.paths = [].concat(this.resolve.modulePaths)
      relativeMod.paths = []

      paths = Module['_nodeModulePaths'](relative)
      relativeModules[relative] = relativeMod
    }

    paths.forEach((v) => {
      if (relativeMod.paths.indexOf(v) === -1) {
        relativeMod.paths.push(v)
      }
    })

    try {
      return Module['_resolveFilename'](moduleName, relativeMod)
    } catch (err) {
      return null
    }
  },

  load (moduleName, relative) {
    if (requiredModules[moduleName]) {
      return requiredModules[moduleName]
    }

    let modulePath = this.getNodeModulePath(moduleName, relative)
    let $module = null
    try {
      $module = require(modulePath)
    } catch (err) {
      if (err.message !== 'missing path') {
        console.log(err)
      }
    }

    if ($module) {
      $module = $module.default ? $module.default : $module
      requiredModules[moduleName] = $module
    }
    return $module
  },

  loadCompilers (compilers) {
    if (_.isArray(compilers)) {
      for (const lang of compilers) {
        if (_.isString(lang)) { // plugin key
          this.loadCompiler(lang)
        } else if (_.isObject(lang)) {
          log.warn(`Unknown compiler: ${compilers}`)
        }
      }
    } else if (_.isObject(compilers)) {
      for (let lang in compilers) {
        this.loadCompiler(lang)
      }
    } else {
      log.warn(`Unknown compiler: ${compilers}`)
    }
    debugger
  },

  loadCompiler (lang) {
    if (this.noCompileLangs.indexOf(lang) > -1) {
      return (options: CompilerOptions) => {
        return Promise.resolve(options)
      }
    }

    let pkgName = this.getCompilerName(lang)
    let compiler = this.load(pkgName)

    if (!compiler) {
      this.addLack(pkgName)
      log.warn(`Missing compiler: ${pkgName}.`)
    }
    return compiler
  },

  loadPlugins (plugins) {
    if (_.isArray(plugins)) {
      for (const plugin of plugins) {
        if (_.isString(plugin)) { // plugin key
          this.loadPlugin(plugin)
        } else if (_.isObject(plugin) && _.isFunction(plugin.apply)) { // instance
          // Add plugin instance
          loadedPlugins.push(plugin)
        }
      }
    } else if (_.isObject(plugins)) {
      for (let key in plugins) {
        this.loadPlugin(key, plugins[key])
      }
    } else {
      log.warn(`Unknown plug-in name: ${plugins}`)
    }
  },

  loadPlugin (pluginName: string, pluginConfig: any = {}) {
    if (_.isFunction(pluginConfig)) {
      pluginConfig = pluginConfig()
    }

    if (_.isBoolean(pluginConfig)) {
      pluginConfig = pluginConfig === true ? {} : false
    }

    if (!_.isObject(pluginConfig)) {
      return
    }

    let moduleName = this.getPluginName(pluginName)
    let plugin = this.load(moduleName)

    if (!plugin) {
      this.addLack(moduleName)
      log.warn(`Missing plugin: ${moduleName}`)
    }
    loadedPlugins.push(new plugin(pluginConfig))
  },

  addLack (moduleName) {
    this.lackList.push(moduleName)
  },

  getLacks (): string[] {
    return this.lackList
  },

  PluginHelper
}
