import * as path from 'path'
import * as fs from 'fs-extra'
import * as minimatch from 'minimatch'
import * as _ from 'lodash'
import { PluginHelper } from '@mindev/min-core'
import Config = FilesyncPlugin.Config

export default async function filesync (cwd: string, dest: string, filename: string, status: string, config: Config) {
  // /a/b/c/index.js
  let filepath = path.join(cwd, filename)
  // /a/b
  let fromdirname = path.join(cwd, config.cwd || '.')
  // /a/b/d
  let todirname = path.join(dest, config.to || '')

  if (_.isUndefined(config.from)) {
    return
  }

  // Directory mismatch
  if (filepath.indexOf(fromdirname) === -1) {
    return
  }

  // c/index.js
  let filepart = path.relative(fromdirname, filepath)

  // RegExp test
  if (_.isRegExp(config.test) && !config.test.test(filepart)) {
    return
  }

  // Function validate
  if (_.isFunction(config.validate) && !config.validate(filepart)) {
    return
  }

  let ignores: string[] = []
  if (!_.isUndefined(config.ignore)) {
    ignores = _.isArray(config.ignore) ? config.ignore : [config.ignore]
  }
  let froms = _.isArray(config.from) ? config.from : [config.from]

  for (const ignore of ignores) {
    if (_.isString(ignore) && minimatch(filepart, ignore)) {
      return
    }
  }

  for (let from of froms) {
    if (_.isString(from) && !minimatch(filepart, from)) {
      continue
    }
    let src = filepath
    let dest = path.join(todirname, filepart)

    if (status === 'unlink') {
      await fs.unlink(dest)
    }
    else {
      await copy(cwd, filename, src, dest)
      console.log('同步', filename, '=>', path.relative(cwd, dest))
    }

    return
  }
}

async function copy (cwd: string, filename: string, src: string, dest: string) {
  let destdirname = path.dirname(dest)
  await fs.ensureDir(destdirname)

  let helper = new PluginHelper(PluginHelper.Type.Image, 'imagemin')

  if (helper.isUse) {
    let result = await helper.apply({
      cwd,
      filename
    })
    let { extend = {} } = result
    let { buffer } = extend

    if (buffer) {
      // Create image file from Buffer
      await fs.writeFile(dest, buffer)
      return
    }
  }

  // copy any file
  await fs.copy(src, dest)
}
