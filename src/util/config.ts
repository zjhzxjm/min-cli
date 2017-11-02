import * as fs from 'fs-extra'
import * as path from 'path'
import * as _ from 'lodash'
import defaultConfig from '../config'

type GetPathType = 'file' | 'src' | 'dest' | 'pages' | 'packages' | 'cache.file' | 'cache.xcxast' | 'npm.src' | 'npm.dest'

/**
 * 引擎
 *
 * @param {{ [key: string]: any }} config
 */
function engine (config: { [key: string]: any }) {
  _.forIn(config, (value, key) => {
    if (_.isObject(value)) {
      engine(value)
    } else if (_.isArray(value)) {
      value.forEach(engine)
    } else if (_.isString(value)) {
      config[key] = value.replace(/\{\{([a-z0-9]+)\}\}/g, (match, $1) => {
        if (_.isUndefined(bothConfig[$1])) {
          throw new Error(`找不到变量 ${$1}`)
        }
        return bothConfig[$1]
      })
    }
  })
}

const minConfig = {}
const minConfigMember: string[] = [
  'src', // 源代码的路径
  'packages', // 组件库的路径
  'dest',// 编译后的路径
  'alias', // 别名，如components => src/components
  'prefix',// 前缀，如wxc-
  'npm.scope',// 作用域名，如@minui
  'npm.dest',// npm编译后的路径，如dist/packages
  'projectType'// 项目类型，如component 和 application
]

const proPkgPath = path.join(defaultConfig.cwd, 'package.json')
const minFilePath = path.join(defaultConfig.cwd, defaultConfig.filename)

// in package.json
if (fs.existsSync(proPkgPath)) {
  _.merge(minConfig, _.pick(fs.readJsonSync(proPkgPath)['minConfig'] || {}, minConfigMember))
}

// in min.config.json
if (fs.existsSync(minFilePath)) {
  _.merge(minConfig, _.pick(fs.readJsonSync(minFilePath), minConfigMember))
}

// merge both
const bothConfig = _.merge({}, defaultConfig, minConfig)

engine(bothConfig)

// 默认将 config.npm.scope 放入到 alias 中，并将 config.packages 作为值
if (bothConfig.npm.scope && !bothConfig.alias[bothConfig.npm.scope]) {
  bothConfig.alias[bothConfig.npm.scope] = bothConfig.packages
}

export const config = {
  ...bothConfig,
  getPath (name: GetPathType, ...paths: string[]) {
    let names = name.split('.')

    let value = names.reduce((previousValue: string, currentValue: string) => {
      return previousValue[currentValue]
    }, config)

    return path.join(config.cwd, value, ...paths)
  }
}

export const customConfig = minConfig

export const systemConfig = defaultConfig
