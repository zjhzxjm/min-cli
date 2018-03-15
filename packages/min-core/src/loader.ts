import * as path from 'path'
import * as _ from 'lodash'
import { PluginHelper } from './plugin'
import { CompilerHelper } from './compiler'

const Module = require('module')

let relativeModules: {
  [key: string]: any
} = {}
let requiredModules: {
  [key: string]: object
} = {}
let loadedPlugins: {
  [key: string]: PluginHelper.Plugin
} = {}

export const loader = {
  missingNpms: new Array(),

  noCompileLangs: ['wxml', 'xml', 'css', 'js'],

  getCompilerName (lang: string) {
    let prefix = '@mindev/min-compiler'
    if (lang.indexOf(prefix) === 0) {
      return lang
    }
    return `${prefix}-${lang}`
  },

  getPluginName (name: string) {
    let prefix = '@mindev/min-plugin'
    if (name.indexOf(prefix) === 0) {
      return name
    }
    return `${prefix}-${name}`
  },

  getNodeModulePath (moduleName: string, relative = process.cwd()) {
    if (typeof Module === 'object') {
      return null
    }

    let relativeMod = relativeModules[relative]
    let paths: string[] = []

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
    }
    catch (err) {
      return null
    }
  },

  load (moduleName: string, relative?: string) {
    if (requiredModules[moduleName]) {
      return requiredModules[moduleName]
    }

    let modulePath = this.getNodeModulePath(moduleName, relative)
    let $module = null
    try {
      $module = require(modulePath)
    }
    catch (err) {
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

  loadCompilers (compilers: string[] | {[key: string]: object}) {
    if (_.isArray(compilers)) {
      for (let lang of compilers) {
        this.loadCompiler(lang)
      }
    }
    else if (_.isObject(compilers)) {
      for (let lang in compilers) {
        this.loadCompiler(lang)
      }
    }
    else {
      console.warn(`Unknown compiler: ${compilers}`)
    }
  },

  loadCompiler (lang: string) {
    if (this.noCompileLangs.indexOf(lang) > -1) {
      return (options: CompilerHelper.Options) => {
        return Promise.resolve(options)
      }
    }

    let compilerName = this.getCompilerName(lang)
    let compilerClass = this.load(compilerName)

    if (!compilerClass) {
      this.addMissingNpm(compilerName)
      console.warn(`Missing compiler: ${compilerName}.`)
    }
    return compilerClass
  },

  loadPlugins (plugins: string[] | {[key: string]: object | boolean | Function}) {
    if (_.isArray(plugins)) {
      for (let plugin of plugins) {
        this.loadPlugin(plugin)
      }
    }
    else if (_.isObject(plugins)) {
      for (let key in plugins) {
        this.loadPlugin(key, plugins[key])
      }
    }
    else {
      console.warn(`Unknown plug-in name: ${plugins}`)
    }
  },

  loadPlugin (name: string, config: object | boolean | Function = true, force = true): PluginHelper.Plugin | null {
    if (_.isFunction(config)) {
      config = config()
    }

    if (_.isBoolean(config)) {
      config = config === true ? {} : false
    }

    if (!_.isObject(config)) {
      return null
    }

    let pluginName = this.getPluginName(name)
    let plugin = loadedPlugins[pluginName] || null

    if (!force && plugin) {
      return plugin
    }

    let PluginClass = this.load(pluginName)

    if (!PluginClass) {
      this.addMissingNpm(pluginName)
      console.warn(`Missing plugin: ${pluginName}`)
      return null
    }
    else {
      plugin = new PluginClass(config)
      loadedPlugins[pluginName] = plugin
    }

    return plugin
  },

  getPlugin (name: string): PluginHelper.Plugin | null {
    name = this.getPluginName(name)
    return loadedPlugins[name] || null
  },

  getPlugins (type: PluginHelper.Type) {
    let plugins: PluginHelper.Plugin[] = []

    for (let name in loadedPlugins) {
      plugins.push(loadedPlugins[name])
    }
    return plugins
  },

  addMissingNpm (name: string) {
    this.missingNpms.push(name)
  },

  getMissingNpms (): string[] {
    return this.missingNpms
  },

  PluginHelper
}

export default loader
