import path from 'path'
import fs from 'fs-extra'
import minimatch from 'minimatch'
import * as _ from 'lodash'
import Config = FilesyncPlugin.Config

export default function filesync (cwd: string, filename: string, config: Config[]) {
  config.forEach(syncTo.bind(null, cwd, filename))
}

function syncTo (cwd: string, filename: string, config: Config) {
  // /a/b/c/index.js
  let filepath = path.join(cwd, filename)
  // /a/b
  let fromdirname = path.join(cwd, config.cwd)
  // /a/b/d
  let todirname = path.join(fromdirname, config.to)

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

  let ignores = _.isArray(config.ignore) ? config.ignore : [config.ignore]
  let froms = _.isArray(config.from) ? config.from : [config.from]

  for (const ignore of ignores) {
    if (_.isString(ignore) && minimatch(filepart, ignore)) {
      return
    }
  }

  froms.forEach(from => {
    if (_.isString(from) && !minimatch(filepart, from)) {
      return
    }
    let src = filepath
    let dest = path.join(todirname, filepart)

    syncCopy(src, dest)
  })
}

function syncCopy (src: string, dest: string) {
  let dirname = path.dirname(src)
  fs.ensureDirSync(dirname)
  fs.copyFileSync(src, dest)
}
