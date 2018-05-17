'use strict'

import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'
import * as _ from 'lodash'
import * as changeCase from 'change-case'
import { prompt, Question } from 'inquirer'
import * as memFs from 'mem-fs'
import * as editor from 'mem-fs-editor'
import { CLIExample } from '../class'
import { ScaffoldType, ProjectType, NewType } from '../declare'
import util, { config, defaultConfig, exec, log, LogType, filterPrefix, filterNpmScope, getGitUser, beautifyJs } from '../util'
import { NewCommand } from './new'
import core from '@mindev/min-core'

/**
 * Commander 命令行配置
 */
export default {
  name: 'init [project-name]',
  alias: '',
  usage: '[project-name]',
  description: 'Generate a new project.',
  options: [],
  on: {
    '--help': () => {
      new CLIExample('init')
        .group('create project')
        .rule('my-project')
    }
  },
  async action (rawName: string, cliOptions: InitCommand.CLIOptions) {
    try {
      let { isContinue, projectName, projectPath } = await validateInfo(rawName)

      if (!isContinue) {
        return
      }

      // 获取 answers
      let answers = await getAnswers(projectName)

      // 字段做容错处理
      let defaults = {
        // The default
        projectPath,

        // Continue to
        useExample: answers.projectType === ProjectType.Component ? true : false,
        useGlobalStyle: true,
        useGlobalTemplate: answers.projectType === ProjectType.Application ? true : false,

        // Didn't define
        packagePrefix: config.prefix,
        projectDest: defaultConfig.dest,
        npmDest: defaultConfig.npm.dest
      }

      answers = _.merge(defaults, answers, {
        projectNameToCamelCase: changeCase.camelCase(answers.projectName),
        packagePrefixStr: filterPrefix(config.prefix),
        packageScopeStr: filterNpmScope(answers.packageScope),
        projectTypeStr: getProjectTypeStr(answers.projectType),
        completeContinueNewPackage: true,
        options: {
          ProjectType
        }
      })

      let initCommand = new InitCommand(answers)
      await initCommand.run()

    } catch (err) {
      core.util.error(err)
    }
  }
}

/**
 * 初始化类
 *
 * @export
 * @class InitCommand
 */
export class InitCommand {
  constructor (public options: InitCommand.Options) {

  }

  async run () {
    let { completeContinueNewPackage } = this.options

    // 拷贝 脚手架模板
    await this.copyScaffold()

    await this.updateConfig()

    if (completeContinueNewPackage) {
      await this.newPackage()
    }

    await this.npmInstall()

    await this.minBuild()

    // 提示使用
    log.newline()
    log.msg(LogType.TIP, `项目创建完成，请在 "微信开发者工具" 中新建一个小程序项目，项目目录指向新建工程根目录。`)
  }

  private async copyScaffold (): Promise<any> {
    const { projectName, projectPath, projectType, projectTypeStr } = this.options

    // 内存编辑器
    const store = memFs.create()
    const fsEditor = editor.create(store)

    let packageData = generatePackageData(this.options)

    // 拷贝 project.common 脚手架模板
    fsEditor.copyTpl(
      util.getScaffoldPath(ScaffoldType.Project, 'common'),
      projectPath,
      {
        ...this.options,
        packageData
      },
      null,
      {
        globOptions: {
          dot: true
        }
      }
    )

    // 拷贝 project.type 脚手架模板
    fsEditor.copyTpl(
      util.getScaffoldPath(ScaffoldType.Project, projectType),
      projectPath,
      this.options
    )

    return new Promise((resolve, reject) => {
      // 保存
      fsEditor.commit(() => {
        log.newline()
        log.msg(LogType.CREATE, `项目 "${projectName}" in "${projectPath}"`)

        // 输入拷贝 或 新增 的日志信息
        let files = glob.sync('**', {
          cwd: projectPath
        })
        files.forEach(file => log.msg(LogType.COPY, file))

        log.msg(LogType.COMPLETE, `"${projectTypeStr}"项目已创建完成`)
        resolve()
      })
    })
  }

  private async updateConfig () {
    let { options } = this
    // 更新CONFIG.CWD
    config.update({
      cwd: options.projectPath,
      projectType: options.projectType,
      prefix: options.packagePrefix,
      dest: options.projectDest,
      npm: {
        dest: options.npmDest,
        scope: options.packageScope
      }
    })
  }

  private async newPackage () {
    let { projectType } = this.options
    if (projectType !== ProjectType.Component) {
      return
    }

    // 执行 min new 创建
    log.newline()
    log.msg(LogType.INFO, '准备为您创建一个新的组件')
    log.msg(LogType.RUN, '命令：min new')
    let newCommand = new NewCommand({
      type: NewType.Package
    })
    await newCommand.run()
  }

  private async npmInstall () {
    let { projectPath } = this.options
    // 执行 npm install
    log.newline()
    log.msg(LogType.RUN, '命令：npm install')
    log.msg(LogType.INFO, '安装中, 请耐心等待...')
    await exec('npm', ['install'], true, {
      cwd: projectPath
    })
  }

  private async minBuild () {
    let { projectPath } = this.options
    // 执行 min build 构建
    log.newline()
    log.msg(LogType.RUN, '命令：min build')
    log.msg(LogType.INFO, '编译中, 请耐心等待...')
    await exec('min', ['build'], true, {
      cwd: projectPath
    })
  }
}

async function validateInfo (rawName: string) {
  const inCurDir = !rawName || rawName === '.'
  const projectName = inCurDir ? path.relative('../', process.cwd()) : rawName
  const projectPath = path.resolve(rawName || '.')

  if (fs.existsSync(projectPath)) {
    return prompt([{
      type: 'confirm',
      message: inCurDir
        ? 'Generate project in current directory?'
        : 'Target directory exists. Continue?',
      name: 'ok'
    }]).then(answers => {
      return {
        isContinue: answers.ok,
        projectName,
        projectPath
      }
    })
  }

  return {
    isContinue: true,
    projectName,
    projectPath
  }
}

function getAnswers (projectName: string): Promise<InitCommand.Options> {

  let selectProjectType = {
    type: 'list',
    message: 'Select project type.',
    name: 'projectType',
    default: ProjectType.Application,
    choices: () => {
      return [{
        name: 'Create a new application',
        value: ProjectType.Application
      }, {
        name: 'Create a new component library',
        value: ProjectType.Component
      }]
    }
  }

  let enterProjectName = {
    type: 'input',
    message: 'Project name',
    name: 'projectName',
    default: projectName,
    filter (input: string) {
      return input.trim()
    },
    validate (input: string, answers: any) {
      if (input === '') {
        return 'Please input!'
      }
      return true
    }
  }

  let enterAppId = {
    type: 'input',
    message: 'AppId',
    name: 'appId',
    default: 'touristappid',
    filter (input: string) {
      return input.trim()
    },
    validate (input: string, answers: any) {
      if (input === '') {
        return 'Please input!'
      }
      return true
    }
  }

  let enterDescription = {
    type: 'input',
    message: 'Project description',
    name: 'description',
    default: 'A Min project'
  }

  let enterPackageScope = {
    type: 'input',
    message: 'Package NPM scope name',
    name: 'packageScope',
    filter (input: string) {
      return input.trim()
    },
    validate (input: string, answers: any) {
      if (input !== '') {
        if (!input.startsWith('@')) {
          return `The format is incorrect. Please start with the @ symbol, for example ${defaultConfig.npm.scope}`
        } else if (input.endsWith('/')) {
          return `The format is not correct, please do not end with "/", for example ${defaultConfig.npm.scope}`
        }
      }
      return true
    },
    when (answers: any) {
      return answers.projectType === ProjectType.Component
    }
  }

  let useESLint = {
    type: 'confirm',
    message: 'Use ESLint to lint your code?',
    name: 'useESLint',
    default: true
  }

  let useMinx = {
    type: 'confirm',
    message: 'Use Minx in your project?',
    name: 'useMinx',
    default: true
  }

  let enterAuthor = {
    type: 'input',
    message: 'Author',
    name: 'author',
    default () {
      return getGitUser()
    }
  }

  let confirmContinue = {
    type: 'confirm',
    message: 'Continue advanced Settings?',
    name: 'isContinue',
    default: true
  }

  let useGlobalStyle = {
    type: 'confirm',
    message: 'Use Global Style in your project?',
    name: 'useGlobalStyle',
    default: true,
    when (answers: any) {
      return !!answers.isContinue
    }
  }

  let useGlobalTemplate = {
    type: 'confirm',
    message: 'Use Global Template in your project?',
    name: 'useGlobalTemplate',
    default: true,
    when (answers: any) {
      return !!answers.isContinue && answers.projectType === ProjectType.Application
    }
  }

  return prompt([
    selectProjectType,
    enterProjectName,
    enterAppId,
    enterDescription,
    enterPackageScope,
    useESLint,
    useMinx,
    enterAuthor,
    confirmContinue,
    useGlobalStyle,
    useGlobalTemplate
  ]) as Promise<InitCommand.Options>
}

function getProjectTypeStr (projectType: ProjectType) {
  switch (projectType) {
    case ProjectType.Component:
      return '小程序组件库'

    case ProjectType.Application:
      return '小程序应用'

    default:
      throw new Error('未知项目类型')
  }
}

export namespace InitCommand {
  /**
   * 选项
   *
   * @export
   * @interface Options
   */
  export interface Options {
    projectPath: string
    projectType: ProjectType
    projectTypeStr?: string
    projectName: string
    appId?: string
    description?: string
    packageScope?: string
    packageScopeStr?: string
    useESLint: boolean
    useMinx: boolean
    author?: string
    useGlobalStyle: boolean
    useGlobalTemplate?: boolean
    packagePrefix?: string
    packagePrefixStr?: string
    projectDest: string
    npmDest?: string
    useExample: boolean
    completeContinueNewPackage?: boolean
  }

  /**
   * CLI选项
   *
   * @export
   * @interface CLIOptions
   */
  export interface CLIOptions {

  }
}

function generatePackageData (answers: InitCommand.Options) {
  let dependencies = {}
  let devDependencies = {}

  if (answers.useMinx) {
    dependencies['@minlib/minx'] = '^2.0.0'
  }

  if (answers.useExample) {
    dependencies['@minui/wxc-example'] = '^1.0.0'
    dependencies['@minui/wxc-example-demo'] = '^1.0.0'
    dependencies['@minui/wxc-example-md'] = '^1.0.0'
    dependencies['@minui/wxc-example-menu'] = '^1.0.0'
  }

  if (answers.useESLint) {
    devDependencies['@mindev/min-lint-eslint'] = '^2.0.0'
  }

  return {
    name: answers.projectName,
    description: answers.description,
    version: '1.0.0',
    // repository: {
    //   type: 'git',
    //   url: answers.gitRepo
    // },
    author: answers.author,
    license: 'MIT',
    dependencies: {
      '@minlib/min': '^2.0.0',
      ...dependencies
    },
    devDependencies: {
      '@mindev/min-compiler-babel': '^2.0.0',
      'babel-plugin-syntax-export-extensions': '^6.13.0',
      'babel-plugin-transform-class-properties': '^6.24.1',
      'babel-plugin-transform-decorators-legacy': '^1.3.4',
      'babel-plugin-transform-export-extensions': '^6.22.0',
      'babel-preset-env': '^1.6.1',
      ...devDependencies
    },
    minConfig: {
      projectType: answers.projectType
    }
  }
}

// let enterPackagePrefix = {
//   type: 'input',
//   message: 'Npm prefix name',
//   name: 'packagePrefix',
//   default (answers: any) {
//     return defaultConfig.prefix.replace(/[-]+$/, '')
//   },
//   filter (input: string) {
//     return input.trim()
//   },
//   validate (input: string, answers: any) {
//     if (input === '') {
//       return 'Please input!'
//     } else if (/^-/.test(input)) {
//       return 'The format is incorrect and cannot begin with "-".'
//     } else if (/-$/.test(input)) {
//       return 'The format is incorrect and cannot end with "-".'
//     } else if (/[^a-z-]+/.test(input)) {
//       return `The format is not correct, can only be lowercase letter, multiple words use "-" to separate.`
//     }
//     return true
//   },
//   when (answers: any) {
//     return !!answers.isContinue && answers.projectType === ProjectType.Component
//   }
// }

// let enterDest = {
  //   type: 'input',
  //   message: 'Project compilation output path.',
  //   name: 'dest',
  //   default: defaultConfig.dest,
  //   filter (input: string) {
  //     return input.trim()
  //   },
  //   validate (input: string, answers: any) {
  //     if (input === '') {
  //       return 'Please input!'
  //     }
  //     return true
  //   },
  //   when (answers: any) {
  //     return !!answers.isContinue
  //   }
  // }

  // let enterNpmDest = {
  //   type: 'input',
  //   message: 'The project relies on the NPM package to compile the output path.',
  //   name: 'npmDest',
  //   default (answers: any) {
  //     // dist/packages => packages
  //     return defaultConfig.npm.dest.replace(`${defaultConfig.dest}/`, '')
  //   },
  //   filter (input: string) {
  //     input = input.trim()
  //     if (input !== '') {
  //       // 由于 @types/inquirer v0.0.35 版本未提供 filter 函数第二个answers入参，但 inquirer 包已支持，因此在这里通过 arguments 得到入参集合
  //       let answers = arguments[1] || {}
  //       // dist + packages => dist/packages
  //       return `${answers.dest}/${input}`
  //     }
  //     return input
  //   },
  //   validate (input: string, answers: any) {
  //     if (input === '') {
  //       return 'Please input!'
  //     }
  //     return true
  //   },
  //   when (answers: any) {
  //     return !!answers.isContinue && answers.projectType === ProjectType.Component
  //   }
  // }

  // let enterGitRepo = {
  //   type: 'input',
  //   message: 'Git repository',
  //   name: 'gitRepo',
  //   when (answers: any) {
  //     return !!answers.isContinue
  //   }
  // }
