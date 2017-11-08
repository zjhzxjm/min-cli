/// <reference path="../..//types/index.d.ts" />

'use strict'

import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'
import * as _ from 'lodash'
import * as changeCase from 'change-case'
import { prompt, Question, Answers } from 'inquirer'
import * as memFs from 'mem-fs'
import * as editor from 'mem-fs-editor'
import { CLIExample } from '../class'
import { DevType, ScaffoldType, ProjectType } from '../declare'
import util, { systemConfig, exec, log, LogType } from '../util'

/**
 * 初始化命令行选项
 *
 * @export
 * @interface InitCommand
 */
export interface InitCommand {

  /**
   * 标题
   *
   * @type {string}
   * @memberof InitCommand
   */
  title: string

  /**
   * 类型
   *
   * @type {number}
   * @memberof InitCommand
   */
  type: number
}

export default {
  isAvailable (devType?: DevType) {
    // TODO
  },
  name: 'init [name]',
  alias: '',
  usage: '[name]', // [-t | --title <title>]
  description: '创建项目',
  options: [
    // ['-t, --title <title>', 'Project title']
    // ['-s, --scope <scope>', 'Npm scope name for component'],
    // ['-d, --dest <dest>', 'Compiled target path'],
    // ['--type [type]', 'Project type，default is 0, 0 is component, and 1 is application']
  ],
  on: {
    '--help': () => {
      new CLIExample('init')
        .group('create project')
        .rule('')
        // .group('set project title')
        // .rule('--title MinUI')
        // .group('set npm scope name')
        // .rule('--scope @minui')
        // .group('set compiled target path')
        // .rule('--dest dist')
        // .group('set project type as application')
        // .rule('--type 1')
    }
  },
  async action (proName: string, options: InitCommand) {
    try {
      // 获取 answers
      let answers = await getAnswers(proName)

      // 项目名称为空，从路径里获取文件名
      proName = proName || path.basename(answers.proPath)

      // 字段做容错处理
      let defaults = {
        proName,
        proNameToCamelCase: changeCase.camelCase(proName),
        title: systemConfig.title,
        description: answers.title || systemConfig.title,
        prefix: '',
        useExample: true,
        useGlobalStyle: true,
        useGlobalLayout: true,
        dest: systemConfig.dest,
        npmScope: '',
        npmDest: '',
        gitUrl: '',
        author: ''
      }

      answers = _.merge(defaults, answers)

      // 拷贝 脚手架模板
      await copyScaffold(answers)

      // 执行 npm install
      log.msg(LogType.RUN, '命令：npm install')
      log.msg(LogType.INFO, '安装中, 请耐心等待...')
      await exec('npm', ['install'], true, {
        cwd: answers.proPath
      })

      // 执行 min build 构建
      log.msg(LogType.RUN, '命令：min build')
      log.msg(LogType.INFO, '编译中, 请耐心等待...')
      await exec('min', ['build'], true, {
        cwd: answers.proPath
      })

      // 提示使用
      log.msg(LogType.TIP, `项目创建完成，请在 "微信开发者工具" 中新建一个小程序项目，项目目录指向新建工程里的 ${answers.dest}/ 文件夹。如此，组件就能在开发者工具中进行预览了`)
    } catch (err) {
      console.log(err)
    }
  }
}

function getAnswers (proName: string): Promise<Answers> {
  const CREATE_QUESTIONS: Question[] = [
    {
      type: 'input',
      message: '请设置项目目录',
      name: 'proPath',
      default (answers: any) {
        return util.getDestProjectPath(proName || '')
      },
      validate (proPath: string, answers: any) {
        if (!proPath || !proPath.trim()) {
          return '项目目录不能为空'
        }

        if (!path.isAbsolute(proPath)) {
          return `项目目录：'${proPath}' 格式不正确，请更换绝对路径`
        }

        if (fs.existsSync(proPath) && glob.sync('**', { cwd: proPath }).length > 0 ) {
          return `项目目录：'${proPath}' 不是空目录，请更换`
        }
        return true
      }
    }, {
      type: 'list',
      message: '请选择项目类型',
      name: 'projectType',
      default: ProjectType.Application,
      choices: () => {
        return [{
          name: '新建小程序',
          value: ProjectType.Application
        }, {
          name: '新建组件库',
          value: ProjectType.Component
        }]
      }
    }, {
      type: 'confirm',
      message: '是否继续高级设置',
      name: 'isContinue',
      default: true
    }, {
      type: 'input',
      message: '请设置项目标题',
      name: 'title',
      default: systemConfig.title,
      when (answers: any) {
        return !!answers.isContinue
      }
    }, {
      type: 'input',
      message: '请设置项目描述',
      name: 'description',
      when (answers: any) {
        return !!answers.isContinue
      }
    }, {
      type: 'input',
      message: '请设置组件名前缀',
      name: 'prefix',
      default: systemConfig.prefix,
      when (answers: any) {
        return !!answers.isContinue && answers.projectType === ProjectType.Component
      }
    }, {
      type: 'confirm',
      message: '是否使用系统自带的Example组件（编写组件Demo示例和Api文档）',
      name: 'useExample',
      default: true,
      when (answers: any) {
        return !!answers.isContinue && answers.projectType === ProjectType.Component
      }
    }, {
      type: 'confirm',
      message: '是否使用全局变量',
      name: 'useGlobalStyle',
      default: true,
      when (answers: any) {
        return !!answers.isContinue
      }
    }, {
      type: 'confirm',
      message: '是否使用全局模板',
      name: 'useGlobalLayout',
      default: true,
      when (answers: any) {
        return !!answers.isContinue
      }
    }, {
      type: 'input',
      message: '请设置项目打包保存路径',
      name: 'dest',
      default: systemConfig.dest,
      when (answers: any) {
        return !!answers.isContinue
      }
    }, {
      type: 'input',
      message: '请设置 npm scope 名称',
      name: 'npmScope',
      default: systemConfig.npm.scope,
      when (answers: any) {
        return !!answers.isContinue && answers.projectType === ProjectType.Component
      }
    }, {
      type: 'input',
      message: '请设置 npm 依赖编译后的保存路径',
      name: 'npmDest',
      default: systemConfig.npm.dest,
      when (answers: any) {
        return !!answers.isContinue && answers.projectType === ProjectType.Component
      }
    }, {
      type: 'input',
      message: '请设置 git repository 地址',
      name: 'gitUrl',
      when (answers: any) {
        return !!answers.isContinue
      }
    }, {
      type: 'input',
      message: '请设置 author',
      name: 'author',
      default: process.env.USER,
      when (answers: any) {
        return !!answers.isContinue
      }
    }
  ]

  return prompt(CREATE_QUESTIONS)
}

function copyScaffold (content: any): Promise<any> {
  const { proPath } = content

  // 内存编辑器
  const store = memFs.create()
  const fsEditor = editor.create(store)

  // 拷贝 project 脚手架模板
  fsEditor.copyTpl(
    util.getScaffoldPath(ScaffoldType.Project),
    proPath,
    content
  )

  return new Promise((resolve, reject) => {
    // 保存
    fsEditor.commit(() => {
      log.msg(LogType.CREATE, `项目 "${proPath}"`)

      // 输入拷贝 或 新增 的日志信息
      let files = glob.sync('**', {
        cwd: proPath
      })
      files.forEach(file => log.msg(LogType.COPY, file))
      resolve()
    })
  })
}
