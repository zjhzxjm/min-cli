import * as path from 'path'
import * as _ from 'lodash'
import { PluginHelper } from './plugin'
import { CompilerHelper } from './compiler'
import util from './util'

import Compiler = CompilerHelper.Compiler
import Plugin = PluginHelper.Plugin

type Compilers = {
  [lang: string]: Compiler
}

type CompilerConfig = object
type CompilerConfigs = {
  [lang: string]: CompilerConfig
}

type Plugins = {
  [name: string]: Plugin
}

type PluginMap = {
  [name: string]: PluginConfig
}

type PluginConfig = object | boolean | Function

type PluginConfigs = string[] | PluginMap

const Module = require('module')

let relativeModules: {
  [key: string]: any
} = {}

let requiredModules: {
  [key: string]: object
} = {}

let loadedPlugins: Plugins = {}

export const loader = {
  missingNpms: new Array(),

  noCompileLangs: ['wxml', 'xml', 'wxss', 'css', 'js'],

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

    // For example DefinePlugin
    if (/plugin$/i.test(name)) {
      name = name.replace(/plugin$/i, '').toLowerCase()
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
        console.error(err)
      }
    }

    if ($module) {
      $module = $module.default ? $module.default : $module
      requiredModules[moduleName] = $module
    }
    return $module
  },

  loadCompilers (compilerConfigs: CompilerConfigs): Compilers {
    let compilers: Compilers = {}

    for (let lang in compilerConfigs) {
      let compiler = this.loadCompiler(lang)

      if (compiler) {
        compilers[lang] = compiler
      }
    }

    util.debug('loader.loadCompilers', util.keys(compilers))

    return compilers
  },

  loadCompiler (lang: string): Compiler | null {
    if (this.noCompileLangs.indexOf(lang) > -1) {
      return (options: CompilerHelper.Options) => {
        return Promise.resolve(options)
      }
    }

    if (!lang) {
      return null
    }

    let pkgName = this.getCompilerName(lang)
    let compiler = this.load(pkgName) || null

    if (!compiler) {
      this.addMissingNpm(pkgName)
      util.log(`找不到编译器：${lang}.`, 'warning')
    }

    return compiler
  },

  loadPlugins (pluginConfigs: PluginConfigs): Plugin[] {
    let plugins: Plugin[] = []
    let pluginMap: PluginMap = {}

    if (_.isArray(pluginConfigs)) {
      pluginMap = _.fromPairs(pluginConfigs.map(plugin => {
        // [[define, true], [filemin, true]]=> { define: true, filemin: true }
        return [plugin, true]
      }))
    }
    else if (_.isObject(pluginConfigs)) {
      pluginMap = pluginConfigs
    }

    for (let name in pluginMap) {
      let plugin = this.loadPlugin(name, pluginMap[name])

      if (!plugin) {
        continue
      }

      plugins.push(plugin)
    }

    util.debug('loader.loadPlugins', plugins.map(plugin => plugin.name))

    return plugins
  },

  loadPlugin (name: string, config: PluginConfig = true, force = true): Plugin | null {
    if (_.isFunction(config)) {
      config = config()
    }

    if (_.isBoolean(config)) {
      config = config === true ? {} : false
    }

    if (!_.isObject(config)) {
      return null
    }

    if (!name) {
      return null
    }

    let pkgName = this.getPluginName(name)
    let plugin = loadedPlugins[pkgName] || null

    if (!force && plugin) {
      return plugin
    }

    let PluginClass = this.load(pkgName)

    if (!PluginClass) {
      this.addMissingNpm(pkgName)
      // util.warn(`找不到插件：${name}.`)
      return null
    }

    plugin = new PluginClass(config)
    loadedPlugins[pkgName] = plugin

    return plugin
  },

  getPlugin (name: string): PluginHelper.Plugin | null {
    let pkgName = this.getPluginName(name)
    return loadedPlugins[pkgName] || null
  },

  getPlugins (type: PluginHelper.Type): Plugin[] {
    let plugins: Plugin[] = []

    plugins = _
      .values(loadedPlugins)
      .filter(plugin => plugin.type === type)

    return plugins
  },

  addMissingNpm (name: string) {
    let { missingNpms } = this
    if (missingNpms.indexOf(name) !== -1) {
      return
    }
    missingNpms.push(name)
  },

  async tryInstall (pkgName: string) {
    try {
      await util.exec(`npm info ${pkgName}`, true)
    }
    catch (err) {
      util.log(`不存在插件/编译器：${pkgName}, 请检测是否拼写错误.`, '错误')
      throw err
    }

    try {
      util.log(`正在尝试安装 ${pkgName}, 请稍等.`)
      await util.exec(`npm install ${pkgName} --save-dev --production=false`)
      util.log(`已完成安装 ${pkgName}.`, '完成')
    }
    catch (err) {
      util.log(`安装插件/编译器失败：${pkgName}, 请尝试运行命令 "npm install ${pkgName} --save-dev" 进行安装.`, '错误')
      throw err
    }
  },

  async checkLoader (config: any) {
    let { missingNpms } = this

    util.timeStart('loadCompilers')
    this.loadCompilers(config.compilers)
    util.timeEnd('loadCompilers')

    util.timeStart('loadPlugins')
    this.loadPlugins(config.plugins)
    util.timeEnd('loadPlugins')

    if (missingNpms.length > 0) {
      util.log('检测到缺少 Min 的插件/编译器, 正在尝试安装, 请稍等.')
    }

    try {
      for (let pkgName of missingNpms) {
        await this.tryInstall(pkgName)
      }
    }
    catch (err) {
      throw err
    }
    finally {
      this.missingNpms = []
    }
  },

  PluginHelper
}

export default loader
