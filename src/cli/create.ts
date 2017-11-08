/// <reference path="../..//types/index.d.ts" />

'use strict'

import * as fs from 'fs-extra'
import * as memFs from 'mem-fs'
import * as editor from 'mem-fs-editor'
import * as changeCase from 'change-case'
import * as _ from 'lodash'
import { prompt, Question, Answers } from 'inquirer'
import { CLIExample } from '../class'
import { DevType, NewType, ProjectType, ScaffoldType } from '../declare'
import util, { config, log, LogType } from '../util'

/**
 * 新建命令行选项
 *
 * @export
 * @interface CreateCommand
 */
export interface CreateCommand {
  /**
   * 标题
   *
   * @type {String}
   * @memberof CreateCommand
   */
  title: string

  // /**
  //  * 强制创建
  //  *
  //  * @type {Boolean}
  //  * @memberof CreateCommand
  //  */
  // force: Boolean

  // /**
  //  * 基于组件，她具备插件的能力
  //  *
  //  * @type {boolean}
  //  * @memberof CreateCommand
  //  */
  // plugin: boolean
}

export default {
  isAvailable (devType?: DevType) {
    if (!devType) {
      return false
    }

    // 判断 wxc 框架类型
    return devType.framework === 'wxc'
  },
  name: 'new [name]',
  alias: '',
  usage: '[name] [-t | --title <title>]',
  description: '新建组件或页面',
  options: [
    // ['-t, --title <title>', '设置标题'],
    // ['-f, --force', '强制创建覆盖已有的组件和示例'],
    // ['-p, --plugin', '创建插件，她与组件一致，但她具备插件调用能力']
  ],
  on: {
    '--help': () => {
      new CLIExample('new')
      .group('新建组件')
      .rule('loading')

      // .group('创建组件并且设置标题')
      // .rule('loading --title 加载中')

      // .group('覆盖已有的组件')
      // .rule('loading --force')

      // .group('创建插件')
      // .rule('loading --plugin')
    }
  },
  async action (name: string = '', options: CreateCommand) {
    // 获取 answers
    let answers = await getAnswers(name, options.title)

    // 字段做容错处理
    let defaults = {
      pkgName: util.getRealPkgName(name),
      pageName: name,
      title: options.title
    }

    answers = _.merge(defaults, answers)

    create(answers)
  }
}

function getAnswers (name: string, title: string): Promise<Answers> {
  const CREATE_QUESTIONS: Question[] = [
    {
      type: 'list',
      message: '请选择新建类型',
      name: 'newType',
      choices: () => {
        return [{
          name: '新建组件',
          value: NewType.Package
        }, {
          name: '新建页面',
          value: NewType.Page
        }]
      },
      when (answers: any) {
        // for 组件库
        return config.projectType === ProjectType.Component
      }
    }, {
      type: 'input',
      message: '请设置组件的包名',
      name: 'pkgName',
      validate (pkgName: string, answers: any) {
        if (!pkgName || !pkgName.trim()) {
          return '组件的包名不能为空'
        }
        if (pkgName === config.prefix) {
          return `组件的包名格式不正确，例如输入'loading' 或 '${config.prefix}loading'`
        }
        return true
      },
      filter (pkgName: string) {
        return util.getRealPkgName(pkgName)
      },
      when (answers: any) {
        // for new package
        return answers.newType === NewType.Package && (!name || name === config.prefix)
      }
    }, {
      type: 'input',
      message: '请设置组件的标题',
      name: 'title',
      validate (title: string, answers: any) {
        if (!title || !title.trim()) {
          return '组件的标题不能为空'
        }
        return true
      },
      when (answers: any) {
        // for new package
        return answers.newType === NewType.Package && !title
      }
    }, {
      type: 'input',
      message: '请设置页面的名称',
      name: 'pageName',
      validate (pageName: string, answers: any) {
        if (!pageName || !pageName.trim()) {
          return '页面的名称不能为空'
        }
        return true
      },
      when (answers: any) {
        // for new page
        return (answers.newType === NewType.Page || config.projectType === ProjectType.Application) && !name
      }
    }, {
      type: 'input',
      message: '请设置页面的标题',
      name: 'title',
      validate (title: string, answers: any) {
        if (!title || !title.trim()) {
          return '页面的标题不能为空'
        }
        return true
      },
      when (answers: any) {
        // for new page
        return (answers.newType === NewType.Page || config.projectType === ProjectType.Application) && !title
      }
    }
  ]

  return prompt(CREATE_QUESTIONS)
}

function create (answers: any) {
  let pkgName = answers.pkgName
  let pkgNameSuffix = util.getRealPageName(pkgName) // loading

  let pageName = answers.pageName

  let date = new Date()

  // 模板变量
  let content = {
    scope: config.npm.scope,
    version: '1.0.0',
    pkgName, // wxc-loading
    pkgNameToPascalCase: changeCase.pascalCase(pkgName), // WxcLoading
    pkgNameSuffix, // loading
    pkgNameSuffixToPascalCase: changeCase.pascalCase(pkgNameSuffix), // Loading

    pageName, // home
    pageNameToPascalCase: changeCase.pascalCase(pageName), // Home

    title: answers.title, // 组件名称
    description: `MinUI 小程序组件 - ${answers.title}`, // 组件描述
    isPlugin: answers.plugin,
    time: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  }

  switch (config.projectType) {
    case ProjectType.Component: // 组件库
      {
        switch (answers.newType) {
          case NewType.Package:
            {
              // 新建组件
              newPackage(content)
            }
            break

          case NewType.Page:
            {
              // 新建页面
              newPage(content)
            }
            break

          default:
            {
              log.fatal('Min New 失败：未知项目类型，无法继续创建')
            }
            break
        }
      }
      break

    case ProjectType.Application: // 小程序应用
      {
        // 新建页面
        newPage(content)
      }
      break

    default:
      {
        log.fatal('Min New 失败：未知项目类型，无法继续创建')
      }
      break
  }
}

function newPackage (content: any) {
  // 内存编辑器
  const store = memFs.create()
  const fsEditor = editor.create(store)

  // package 目标地址
  let destPackagePath = util.getDestPackagePath(content.pkgName)

  // page 目标地址
  let destPagePath = util.getDestPagePath(content.pkgNameSuffix)

  // 验证 package 目标地址
  if (fs.existsSync(destPackagePath)) {
    log.output(LogType.ERROR, `创建失败，因为组件 "${content.pkgName}" 已经存在`, destPackagePath)
    return
  }

  // 验证 page 目标地址
  if (fs.existsSync(destPagePath)) {
    log.output(LogType.ERROR, `创建失败，因为页面 "${content.pkgNameSuffix}" 已经存在`, destPagePath)
    return
  }

  // 将 package 脚手架模板路径下的文件拷贝到 package 目标路径下
  fsEditor.copyTpl(
    util.getScaffoldPath(ScaffoldType.Package),
    destPackagePath,
    content
  )

  // 创建并写入 package/.npmignore 文件
  fsEditor.write(
    util.getDestPackagePath(content.pkgName, '.npmignore'),
    'test\n*.log\n'
  )

  // 将 example 脚手架模板路径下的文件拷贝到 page 目标路径下
  fsEditor.copyTpl(
    util.getScaffoldPath(ScaffoldType.Example),
    destPagePath,
    content
  )

  // 提交编辑器信息
  fsEditor.commit(() => {
    log.output(LogType.CREATE, `组件 "${content.pkgName}"`, destPackagePath)
    log.output(LogType.CREATE, `页面 "${content.pkgNameSuffix}"`, destPagePath)
  })
}

function newPage (content: any) {
  // 内存编辑器
  const store = memFs.create()
  const fsEditor = editor.create(store)

  // page 目标地址
  let destPagePath = util.getDestPagePath(content.pageName)

  // 验证 page 目标地址
  if (fs.existsSync(destPagePath)) {
    log.output(LogType.ERROR, `创建失败，因为页面 "${content.pageName}" 已经存在`, destPagePath)
    return
  }

  // 将 page 脚手架模板路径下的文件拷贝到 page 目标路径下
  fsEditor.copyTpl(
    util.getScaffoldPath(ScaffoldType.Page),
    destPagePath,
    content
  )

  // 提交编辑器信息
  fsEditor.commit(() => {
    log.output(LogType.CREATE, `页面 "${content.pageName}"`, destPagePath)
  })
}
