'use strict'

import * as _ from 'lodash'
import { prompt, Question, Answers } from 'inquirer'
import { CLIExample } from '../class'
import { DevType } from '../declare'
import util, { config, log } from '../util'

export interface PublishCommand {
}

export default {
  isAvailable (devType?: DevType) {
    if (!devType) {
      return false
    }

    // 判断 wxc 框架类型
    return devType.framework === 'wxc'
  },
  name: 'publish [name]',
  alias: 'pub',
  usage: '[name]',
  description: '发布组件',
  // usage: '[-p | --plugin] [-d | --delete] [-l | --list] [<name>] [--title <title>]',
  // description: 'List, create, or delete package',
  options: [
    // ['-d, --delete', 'delete package'],
  ],
  on: {
    '--help': () => {
      new CLIExample('min publish')
        .group('发布')
        .rule('')
    }
  },
  async action (pkgName: string, options: PublishCommand) {
    util.overrideNpmLog()

    // loading => @minui/wxc-loading
    // wxc-loading => @minui/wxc-loading
    pkgName = pkgName ? util.getRealPkgNameWithScope(pkgName) : ''

    // 获取 answers
    let answers = await getAnswers(pkgName)

    // 字段做容错处理
    let defaults = {
      pkgName
    }

    answers = _.merge(defaults, answers)

    publish(answers)
  }
}

function getAnswers (pkgName: string): Promise<Answers> {
  const CREATE_QUESTIONS: Question[] = [
    {
      type: 'list',
      message: '请选择发布方式',
      name: 'mode',
      default: '0',
      choices: () => {
        return [{
          name: '手动选择要发布的组件',
          value: '0'
        }, {
          name: '发布项目里的每个组件',
          value: '1'
        }]
      },
      when (answers: any) {
        return !pkgName
      }
    }, {
      type: 'list',
      message: '请选择要发布的组件',
      name: 'pkgName',
      choices: () => {
        return getPackages().map((pkg: {name: string, version: string}, index: number) => {
          return {
            name: pkg.name + ' @' + pkg.version,
            value: pkg.name
          }
        })
      },
      when (answers: any) {
        return answers.mode === '0'
      }
    }
  ]

  return prompt(CREATE_QUESTIONS)
}

function getPackages () {
  let PackageUtilities = require('lerna/lib/PackageUtilities')

  return PackageUtilities.getPackages({
    packageConfigs: util.getLernaPackageConfigs(),
    rootPath: config.cwd
  })

  // .map((pkg: any) => {
  //   return {
  //     name: pkg.name,
  //     version: pkg.version ? chalk.grey(`v${pkg.version}`) : chalk.yellow('MISSING'),
  //     private: pkg.isPrivate() ? `(${chalk.red('private')})` : ''
  //   }
  // })
}

function publish (answers: any) {
  let publishArgs = {
    exact: true,
    message: 'Publish by MinDev'
  }

  if (answers.pkgName) {
    let pkgInfo = getPackages().find((item: any) => item.name === answers.pkgName)

    if (pkgInfo) {
      _.merge(publishArgs, {
        scope: pkgInfo.name
      })
    } else {
      log.error(`没有找到组件 ${answers.pkgName}`)
      return
    }
  }

  util.setLernaConfig()

  let { PublishCommand } = require('lerna')
  let publishCommand = new PublishCommand(['publish'], publishArgs, config.cwd)

  publishCommand
    .run()
    .then()
}

// 编译 packages 组件库

// let packageNames: string[] = [] //['loading'].map(name => util.getFullPackageName(name))
// let xcx = new Xcx({
//   isClear: true,
//   packageNames,
//   traverse: {
//     enter (xcxNode: XcxNode) {
//       xcxNode.save()
//     }
//   }
// })
// xcx.compilePackages()
