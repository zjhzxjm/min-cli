import * as fs from 'fs-extra'
import * as path from 'path'
import * as _ from 'lodash'
import { Config, CustomConfig } from '../declare'
import defaultConfig from '../config'

type GetPathType = 'file' | 'src' | 'dest' | 'pages' | 'packages' | 'cache.file' | 'cache.xcxast' | 'npm.src' | 'npm.dest'

// 自定义配置白名单成员
const CUSTOM_CONFIG_MEMBER: string[] = [
  'style',
  'src', // 源代码的路径
  'packages', // 组件库的路径
  'dest',// 编译后的路径
  'alias', // 别名，如components => src/components
  'prefix',// 前缀，如wxc-
  'npm.scope',// 作用域名，如@minui
  'npm.dest',// npm编译后的路径，如dist/packages
  'projectType'// 项目类型，如component 和 application
]

function getCustomConfigFilePath (): string {
  return path.join(defaultConfig.cwd, defaultConfig.filename)
}

function getProjectPackagePath (): string {
  return path.join(defaultConfig.cwd, 'package.json')
}

function getCustomConfig (): { [key: string]: CustomConfig } {
  const pkgPath = getProjectPackagePath()
  const filePath = getCustomConfigFilePath()

  let customConfigFromPkg: CustomConfig = {} // for package.json
  let customConfigFromFile: CustomConfig = {} // for min.config.json

  // in package.json
  if (fs.existsSync(pkgPath)) {
    customConfigFromPkg = _.pick(fs.readJsonSync(pkgPath)['minConfig'] || {}, CUSTOM_CONFIG_MEMBER) as CustomConfig
  }

  // in min.config.json
  if (fs.existsSync(filePath)) {
    customConfigFromFile = _.pick(fs.readJsonSync(filePath), CUSTOM_CONFIG_MEMBER) as CustomConfig
  }

  // merge customConfigFromPkg and customConfigFromFile
  let customConfig = _.merge({}, customConfigFromPkg, customConfigFromFile)

  return {
    customConfig,
    customConfigFromPkg,
    customConfigFromFile
  }
}

function getSystemConfig (): Config {
  return _.cloneDeep<Config>(defaultConfig)
}

function getConfig (systemConfig: Config, customConfig: CustomConfig) {
  // merge systemConfig and minConfig
  let config = _.merge({}, systemConfig, customConfig)

  function engine (rootConfig: Config, childConfig = rootConfig) {
    _.forIn(childConfig, (value: any, key: string) => {
      if (_.isObject(value)) {
        engine(rootConfig, value)
      } else if (_.isArray(value)) {
        value.forEach((item) => {
          engine(rootConfig, item)
        })
      } else if (_.isString(value)) {
        childConfig[key] = value.replace(/\{\{([a-z0-9]+)\}\}/g, (match, $1) => {
          if (_.isUndefined(rootConfig[$1]) || !_.isString(rootConfig[$1])) {
            throw new Error(`找不到变量 ${$1}`)
          }
          return rootConfig[$1]
        })
      }
    })
  }

  engine(config)

  // 默认将 config.npm.scope 放入到 alias 中，并将 config.packages 作为值
  if (config.npm.scope && !config.alias[config.npm.scope]) {
    config.alias[config.npm.scope] = config.packages
  }

  return config
}

let systemConfig = getSystemConfig()
let { customConfig, customConfigFromPkg, customConfigFromFile } = getCustomConfig()

export const config = {
  ...getConfig(systemConfig, customConfig),
  getPath (name: GetPathType, ...paths: string[]) {
    let names = name.split('.')

    let value = names.reduce((previousValue: string, currentValue: string) => {
      return previousValue[currentValue]
    }, this)

    return path.join(this.cwd, value, ...paths)
  },
  update (customConfigFormNew: any) {
    // 将 新的配置 合并到 自定义文件配置里
    _.merge(customConfigFromFile, customConfigFormNew || {})

    // 将 package.json 和 min.config.json 配置更新到 customConfig
    _.merge(customConfig, customConfigFromPkg, customConfigFromFile)

    // 将 systemConfig 和 customConfig 合并到 config
    _.merge(this, getConfig(systemConfig, customConfig))

    let filePath = getCustomConfigFilePath()
    fs.writeFileSync(filePath, JSON.stringify(customConfigFromFile, null, 2))
  }
}

export {
  systemConfig,
  customConfig,
  customConfigFromPkg,
  customConfigFromFile
}
