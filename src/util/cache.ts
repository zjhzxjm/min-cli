import * as path from 'path'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import { XcxNode } from '../class'
import util, { config } from '../util'

function src2relative (src: string) {
  if (!path.isAbsolute(src)) {
    return src
  }
  return path.relative(config.cwd, src)
}

function bindFunChnageArg (target: Object, methods: string[]) {
  methods.forEach(method => {
    let fn = target[method]
    if (!_.isFunction(fn)) return
    target[method] = (src: string, ...args: any[]) => {
      src = src2relative(src)
      args.unshift(src)
      return fn.apply(target, args)
    }
  })
}

function getMdRootWxp (file: string) {
  let extName = path.extname(file)
  let baseName = path.basename(file)
  let dirName = path.dirname(file)
  let packageRegExp = new RegExp(`^${config.packages}/${config.prefixStr}([a-z-]+)$`)

  let mdRootWxpPath = ''
  if (
    // demos/*.wxc
    (extName === config.ext.wxc && /\/demos$/.test(dirName)) ||
    // docs/*.md
    (extName === '.md' && /\/docs$/.test(dirName))) {
    // ~/you_project/src/pages/name/index.wxp
    mdRootWxpPath = path.join(config.cwd, dirName, `../index${config.ext.wxp}`)
  } else if (
    // packages/wxc-name/README.md
    (baseName.toLowerCase() === 'readme.md' && packageRegExp.test(dirName))) {
    let matchs = dirName.match(packageRegExp)
    let pageName = matchs && matchs.length > 1 ? matchs[1] : ''
    // ~/you_project/src/pages/name/index.wxp
    mdRootWxpPath = config.getPath('pages', pageName, `index${config.ext.wxp}`)
  }

  if (mdRootWxpPath && fs.existsSync(mdRootWxpPath)) {
    return mdRootWxpPath
  }
  return ''
}

export const xcxNodeCache = {
  cached: {},
  set (src: string, xcxNode: XcxNode): void {
    this.cached[src] = xcxNode
  },
  get (src: string): XcxNode | null {
    return this.cached[src] || null
  },
  getBeDepends (src: string): string[] {
    let beDepends: string[] = []
    _.forIn(this.cached, (xcxNode: XcxNode, cacheKey: string) => {
      let isExsit = xcxNode.useRequests.some(useRequest => useRequest.srcRelative === src)
      if (isExsit) {
        beDepends.push(cacheKey)
      }
    })
    return beDepends
  },
  remove (src: string): void {
    if (this.check(src)) {
      delete this.cached[src]
    }
  },
  check (src: string): boolean {
    return this.get(src) !== null
  },
  clear () {
    this.cached = {}
  }
}

bindFunChnageArg(xcxNodeCache, ['set', 'get', 'getBeDepends', 'remove', 'check'])

export const xcxNext = {
  /**
   * 缺少依赖的文件列表，在编译过程中发现有依赖缺失的，都会记录到这里
   */
  lack: {},
  /**
   * 换冲区，临时放新增、修改、删除的文件，用完记得清空
   */
  buffer: {},
  addLack (src: string) {
    this.lack[src] = true
  },
  removeLack (src: string) {
    if (this.checkLack(src)) {
      delete this.lack[src]
    }
  },
  checkLack (src: string) {
    return !!this.lack[src]
  },
  watchNewFile (src: string) {
    if (path.extname(src) === config.ext.wxp) {
      this.buffer[src] = true
    }
  },
  watchChangeFile (src: string) {
    if (xcxNodeCache.check(src)) {
      this.buffer[src] = true
    }

    let mdRootWxpPath = getMdRootWxp(src)
    if (mdRootWxpPath) {
      this.buffer[mdRootWxpPath] = true
    }
  },
  watchDeleteFile (src: string) {
    if (xcxNodeCache.check(src)) {
      xcxNodeCache.remove(src)
      let beDepends = xcxNodeCache.getBeDepends(src)
      beDepends.forEach(src => this.buffer[src] = true)
    }

    let mdRootWxpPath = getMdRootWxp(src)
    if (mdRootWxpPath) {
      this.buffer[mdRootWxpPath] = true
    }
  },
  reset () {
    this.buffer = {}
  },
  clear () {
    this.lack = {}
    this.buffer = {}
  },
  get (): string[] {
    let next = {
      ...this.lack,
      ...this.buffer
    }

    return _.keys(next)
  }
}

bindFunChnageArg(xcxNext, ['addLack', 'removeLack', 'checkLack', 'watchNewFile', 'watchChangeFile', 'watchDeleteFile'])

// let xcxAstCachePath = config.getPath('cache.xcxast')
// fs.ensureDirSync(xcxAstCachePath)
// // function getFiles () {
// //   let files = fs.readdirSync(xcxAstCachePath)
// //   let result = {}
// //   files.forEach(file => result[`${file}`] = true)
// //   return result
// // }
// export const xcxAst = {
//   cached: {},
//   files: {},
//   transform (source: string) {
//     // console.time('sum')
//     let hash = sum(source)
//     // console.timeEnd('sum')
//     let ast = this.cached[hash]

//     if (ast) {
//       return ast
//     }

//     let fileName = `${hash}.json`
//     let filePath = path.join(xcxAstCachePath, fileName)

//     if (this.files[fileName]) {
//       // console.time('read')
//       ast = fs.readJsonSync(filePath)
//       // console.timeEnd('read')
//     } else {
//       let result = babel.transform(source, {
//         ast: true,
//         babelrc: false
//       })
//       ast = result.ast || t.emptyStatement()
//       // delete ast['tokens']
//       // fs.writeJsonSync(filePath, ast)
//     }

//     this.cached[hash] = ast

//     return ast
//   }
// }

// function getCacheKey (request: string, lookUpPaths: string[]) {
//   let cacheKey = request + '\x00' + (lookUpPaths.length === 1 ? lookUpPaths[0] : lookUpPaths.join('\x00'))
//   return cacheKey
// }

// export const requestPathCache = {
//   cached: {},
//   add (request: string, lookUpPaths: string[], filename: string) {
//     let cacheKey = getCacheKey(request, lookUpPaths)
//     this.cached[cacheKey] = filename
//   },
//   remove (request: string) {

//   },
//   get (request: string, lookUpPaths: string[]) {
//     let cacheKey = getCacheKey(request, lookUpPaths)
//     return this.cached[cacheKey]
//   },
//   check (request: string, lookUpPaths: string[]) {
//     return !!this.get(request, lookUpPaths)
//   }
// }

export const xcxCache = {
  cache: {},
  changed: false,
  cachePath: config.getPath('cache.file'),

  get () {
    if (this.cache) {
      return this.cache
    }

    if (util.isFile(this.cachePath)) {
      this.cache = util.readFile(this.cachePath)
      try {
        this.cache = JSON.parse(this.cache)
      } catch (e) {
        this.cache = null
      }
    }

    return this.cache || {}
  },

  set (mpath: util.MPath) {
    let cache = this.get()
    let spath = util.pathToString(mpath)
    cache[spath] = util.getModifiedTime(mpath)
    this.cache = cache
    this.changed = true
  },

  remove (mpath: util.MPath) {
    let cache = this.get()
    let spath = util.pathToString(mpath)
    delete cache[spath]
    this.cache = cache
    this.changed = true
  },

  clear () {
    util.unlink(this.cachePath)
  },

  save () {
    if (this.changed) {
      util.writeFile(this.cachePath, JSON.stringify(this.cache))
      this.changed = false
    }
  },

  check (mpath: util.MPath) {
    let spath = util.pathToString(mpath)
    let cache = this.get()
    return cache[spath] && cache[spath] === util.getModifiedTime(spath)
  }
}
