'use strict'

import * as glob from 'glob'
import * as fs from 'fs-extra'
import * as memFs from 'mem-fs'
import * as editor from 'mem-fs-editor'
import * as changeCase from 'change-case'
import * as _ from 'lodash'
import { prompt, Question, Answers } from 'inquirer'
import core from '@mindev/min-core'
import { CLIExample } from '../class'
import { NewType, ProjectType, ScaffoldType } from '../declare'
import util, { config, log, LogType, filterNpmScope } from '../util'
import { DevCommand } from './dev'

export default {
  name: 'new [name]',
  alias: '',
  usage: '[name] [-t | --type <type>]',
  description: 'Create a new component or page.',
  options: [
    ['-t, --type <type>', 'New type, c is the component; p is the page.']
  ],
  on: {
    '--help': () => {
      new CLIExample('new')
        .group('New component')
        .rule('my-component')

        .group('New page')
        .rule('my-page')
    }
  },
  async action (rawName: string = '', cliOptions: NewCommand.CLIOptions) {

    let projectTypes = [ProjectType.Application, ProjectType.Component].map(item => item.toString())

    if (projectTypes.indexOf(config.projectType) === -1) {
      core.util.error('The current directory is not a project created by Min, so you cannot continue to create components or pages.', false)
      return
    }

    let type: NewType

    if (['c', 'component'].indexOf(cliOptions.type) !== -1) {
      type = NewType.Package
    } else if (['p', 'page'].indexOf(cliOptions.type) !== -1) {
      type = NewType.Page
    } else if (cliOptions.type) {
      core.util.error('option `-t, --type <type> argument incorrect，Please run `min new -h` for help.', false)
      return
    }

    let options: NewCommand.Options = {
      type,
      rawName,
      completeContinueBuild: true
    }

    let command = new NewCommand(options)
    await command.run()
  }
}

export class NewCommand {
  constructor (public options: NewCommand.Options) {
  }

  async run () {
    let { rawName = '', title, type, completeContinueBuild } = this.options

    // 获取 answers
    let answers: NewAnswers = await getAnswers(this.options)

    // 字段做容错处理
    let defaults: NewAnswers = {
      type,
      pkgName: util.getRealPkgName(rawName),
      pageName: rawName,
      title
    }

    answers = _.merge({}, defaults, answers)

    // 新建 组件或页面 脚手架模板
    await this.newScaffold(answers)

    // 更新主页菜单
    await this.updateHomeMenu(answers)

    // 创建组件或页面后，继续编译页面
    if (completeContinueBuild) {
      await this.buildPage(answers)
    }
  }

  /**
   * 新建脚手架模板
   *
   * @param {NewAnswers} answers
   */
  private async newScaffold (answers: NewAnswers) {
    let { pkgName = '', pageName = '', title = '' } = answers

    let pkgNameSuffix = util.getRealPageName(pkgName) // loading
    let date = new Date()
    let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()

    // 模板变量
    let newData: NewData = {
      // common
      title, // 组件名称
      time,

      // component
      npmScopeStr: filterNpmScope(config.npm.scope),
      version: '1.0.0', // 组件版本
      description: `${title} - 小程序组件`, // 组件描述
      pkgName, // wxc-loading
      pkgNameToPascalCase: changeCase.pascalCase(pkgName), // WxcLoading
      pkgNameSuffix, // loading
      pkgNameSuffixToPascalCase: changeCase.pascalCase(pkgNameSuffix), // Loading

      // page and example
      pageName, // home
      pageNameToPascalCase: changeCase.pascalCase(pageName) // Home
    }

    switch (answers.type) {
      case NewType.Package:
        {
          // 新建组件
          await this.newPackage(newData)
        }
        break

      case NewType.Page:
        {
          // 新建页面
          await this.newPage(newData)
        }
        break

      default:
        return Promise.reject('Min New 失败：未知项目类型，无法继续创建')
    }
  }

  /**
   * 新建组件脚手架模板
   *
   * @param {NewData} newData
   */
  private async newPackage (newData: NewData) {
    let { pkgName, pkgNameSuffix } = newData
    let isComponentProjectType = config.projectType === ProjectType.Component

    // 内存编辑器
    const store = memFs.create()
    const fsEditor = editor.create(store)

    // package 目标地址
    let destPackagePath = util.getDestPackagePath(pkgName)

    // page 目标地址
    let destExamplePath = util.getDestPagePath(pkgNameSuffix)

    // 验证 package 目标地址
    if (fs.existsSync(destPackagePath)) {
      log.output(LogType.ERROR, `创建失败，因为组件 "${pkgName}" 已经存在`, destPackagePath)
      return undefined
    }

    // 将 package 脚手架模板路径下的文件拷贝到 package 目标路径下
    fsEditor.copyTpl(
      util.getScaffoldPath(ScaffoldType.Package),
      destPackagePath,
      newData,
      null,
      {
        globOptions: { dot: true }
      }
    )

    if (isComponentProjectType) {

      // 验证 page 目标地址
      if (fs.existsSync(destExamplePath)) {
        log.output(LogType.ERROR, `创建失败，因为页面 "${pkgNameSuffix}" 已经存在`, destExamplePath)
        return undefined
      }

      // 将 example 脚手架模板路径下的文件拷贝到 page 目标路径下
      fsEditor.copyTpl(
        util.getScaffoldPath(ScaffoldType.Example),
        destExamplePath,
        newData
      )
    }

    function printNewComponentLog () {
      log.newline()
      log.output(LogType.CREATE, `组件 "${pkgName}"`, destPackagePath)

      // 输入拷贝 或 新增 的日志信息
      glob.sync('**', {
        cwd: destPackagePath
      }).forEach(file => log.msg(LogType.COPY, file))

      log.msg(LogType.COMPLETE, `组件 "${pkgName}" 创建完成`)
    }

    function printNewExampleLog () {
      if (!isComponentProjectType) {
        return
      }

      log.newline()
      log.output(LogType.CREATE, `示例页面 "${pkgNameSuffix}"`, destExamplePath)

      // 输入拷贝 或 新增 的日志信息
      glob.sync('**', {
        cwd: destExamplePath
      }).forEach(file => log.msg(LogType.COPY, file))

      log.msg(LogType.COMPLETE, `示例页面 "${pkgNameSuffix}" 创建完成`)
    }

    return new Promise((resolve, reject) => {
      // 提交编辑器信息
      fsEditor.commit(() => {

        printNewComponentLog()
        printNewExampleLog()

        resolve()
      })
    })
  }

  /**
   * 新建页面脚手架模板
   *
   * @param {NewData} newData
   */
  private async newPage (newData: NewData) {
    let { pageName } = newData

    // 内存编辑器
    const store = memFs.create()
    const fsEditor = editor.create(store)

    // page 目标地址
    let destPagePath = util.getDestPagePath(pageName)

    // 验证 page 目标地址
    if (fs.existsSync(destPagePath)) {
      log.output(LogType.ERROR, `创建失败，因为页面 "${pageName}" 已经存在`, destPagePath)
      return undefined
    }

    // 将 page 脚手架模板路径下的文件拷贝到 page 目标路径下
    fsEditor.copyTpl(
      util.getScaffoldPath(ScaffoldType.Page),
      destPagePath,
      newData
    )

    return new Promise((resolve, reject) => {
      // 提交编辑器信息
      fsEditor.commit(() => {
        log.newline()
        log.output(LogType.CREATE, `页面 "${pageName}"`, destPagePath)

        // 输入拷贝 或 新增 的日志信息
        glob.sync('**', {
          cwd: destPagePath
        }).forEach(file => log.msg(LogType.COPY, file))

        log.msg(LogType.COMPLETE, `页面 "${pageName}" 创建完成`)

        resolve()
      })
    })
  }

  /**
   * 更新主页菜单
   *
   * @param {NewAnswers} answers
   */
  private async updateHomeMenu (answers: NewAnswers) {

    // Component project type.
    if (config.projectType !== ProjectType.Component) {
      return
    }

    // New package
    if (answers.type !== NewType.Package) {
      return
    }

    let { pkgName = '', title = '' } = answers
    let homeConfigPath = config.getPath('pages', 'home', 'config.json')
    if (!fs.existsSync(homeConfigPath)) {
      return
    }

    let homeConfigData = fs.readJsonSync(homeConfigPath)
    let pages = _.get(homeConfigData, 'menus[0].pages')
    if (_.isArray(pages)) {
      let pageName = util.getRealPageName(pkgName)
      pages.unshift({
        id: pageName,
        name: title,
        icon: '',
        code: ''
      })

      util.writeFile(homeConfigPath, JSON.stringify(homeConfigData, null, 2))
    }
  }

  /**
   * 编译页面
   *
   * @param {NewAnswers} answers
   */
  private async buildPage (answers: NewAnswers) {
    log.newline()
    log.msg(LogType.RUN, '命令：min build')
    log.msg(LogType.INFO, '编译中, 请耐心等待...')

    let devCommand = new DevCommand()
    await devCommand.run()
  }
}

export namespace NewCommand {

  export interface Options {
    /**
     * 新建类型，新建组件或页面
     *
     * @type {NewType}
     * @memberof Options
     */
    type?: NewType

    /**
     * 名称，组件或页面的文件名称，比如“loading”
     */
    rawName?: string

    /**
     * 标题，组件或页面的title名称，比如“加载中”
     *
     * @type {String}
     * @memberof Options
     */
    title?: string

    /**
     * 创建后是否继续编译
     *
     * @type {boolean}
     * @memberof Options
     */
    completeContinueBuild?: boolean
  }

  export interface CLIOptions {
    /**
     * 新建类型，a表示应用，c表示组件库
     *
     * @type {string}
     * @memberof CLIOptions
     */
    type: string
  }
}

/**
 * 获取命令行交互式问答
 *
 * @param {NewCommand.Options} options
 * @returns {Promise<NewAnswers>}
 */
function getAnswers (options: NewCommand.Options): Promise<NewAnswers> {
  let { rawName = '', title = '', type = '' } = options
  let { projectType, prefix, prefixStr } = config

  const selectType = {
    type: 'list',
    message: 'Select the new type.',
    name: 'type',
    choices: () => {
      return [{
        name: 'New component',
        value: NewType.Package
      }, {
        name: 'New page',
        value: NewType.Page
      }]
    },
    when (answers: any) {
      return !type
    }
  }

  const enterPackageName = {
    type: 'input',
    message: 'Component name',
    name: 'pkgName',
    filter (input: string) {
      input = input.trim()
      return util.getRealPkgName(input)
    },
    validate (input: string, answers: any) {
      if (input === '') {
        return 'Please enter name.'
      } else if (input === prefixStr) {
        return `Incorrect format, such as input "loading" or "${prefixStr}loading".`
      } else if (/^-/.test(input)) {
        return 'The format is incorrect and cannot begin with "-".'
      } else if (/-$/.test(input)) {
        return 'The format is incorrect and cannot end with "-".'
      } else if (/[^a-z-]+/.test(input)) {
        return `The format is not correct, can only be lowercase letter, multiple words use "-" to separate.`
      }
      return true
    },
    when (answers: any) {
      // New package
      let isNewPackage = (answers.type || type) === NewType.Package

      // An illegal name.
      let isIllegalName = !rawName || rawName === '-' || rawName === prefix || rawName === prefixStr

      return isNewPackage && isIllegalName
    }
  }

  const enterPackageTitle = {
    type: 'input',
    message: 'Component title',
    name: 'title',
    filter (input: string) {
      return input.trim()
    },
    validate (input: string, answers: any) {
      if (input === '') {
        return 'Please enter the title'
      }
      return true
    },
    when (answers: any) {
      // New package
      let isNewPackage = (answers.type || type) === NewType.Package

      // An illegal title.
      let isIllegalTitle = !title

      return isNewPackage && isIllegalTitle
    }
  }

  const enterPageName = {
    type: 'input',
    message: 'Page name',
    name: 'pageName',
    filter (input: string) {
      return input.trim()
    },
    validate (input: string, answers: any) {
      if (input === '') {
        return 'Please enter name'
      }
      return true
    },
    when (answers: any) {
      // New page
      let isNewPage = (answers.type || type) === NewType.Page

      // An illegal name.
      let isIllegalName = !rawName

      return isNewPage && isIllegalName
    }
  }

  const enterPageTitle = {
    type: 'input',
    message: 'Page title',
    name: 'title',
    filter (input: string) {
      return input.trim()
    },
    validate (input: string, answers: any) {
      if (input === '') {
        return 'Please enter the title'
      }
      return true
    },
    when (answers: any) {
      // New page
      let isNewPage = (answers.type || type) === NewType.Page

      // An illegal title.
      let isIllegalTitle = !title

      return isNewPage && isIllegalTitle
    }
  }

  return prompt([
    selectType,
    enterPackageName,
    enterPackageTitle,
    enterPageName,
    enterPageTitle
  ])
}

/**
 * 交互式问答
 *
 * @interface NewAnswers
 * @extends {Answers}
 */
interface NewAnswers extends Answers {
  type?: NewType
  pkgName?: string
  pageName?: string
  title?: string
}

/**
 * 脚手架模板数据
 *
 * @interface NewData
 */
interface NewData {
  npmScopeStr: string
  version: string
  pkgName: string
  pkgNameToPascalCase: string
  pkgNameSuffix: string
  pkgNameSuffixToPascalCase: string
  description: string
  pageName: string
  pageNameToPascalCase: string
  title: string
  time: string
}
