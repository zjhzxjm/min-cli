import * as path from 'path'
import * as _ from 'lodash'
import { Depend } from './Depend'
import { Request } from './Request'
import util, { log, LogType, config, xcxNext } from '../util'
import core, { PluginHelper } from '@mindev/min-core'

export namespace WxSFM {

  /**
   * 选项
   *
   * @export
   * @interface Options
   */
  export interface Options {

    /**
     * SFM EXT NAME (单文件模块的原生目标路径的扩展名)
     *
     * @type {string}
     * @memberof Options
     */
    destExt: string

    /**
     * 当前模块所在的引用路径
     *
     * @type {string}
     * @memberof Options
     */
    referenceSrc?: string
  }
}

/**
 * 单文件模块
 *
 * @export
 * @class WxSFM
 */
export class WxSFM {
  public source: string
  public rawSource: string
  protected dest: string
  protected destRelative: string
  protected destExt: string
  protected dependParent: string

  /**
   * 隐式引用，例如 less 预编译语言的代码里 import 了外部文件、单文件模块的 src 外部文件
   *
   * @private
   * @type {string[]}
   * @memberof WxSFM
   */
  private implicitReferences: string[] = []

  /**
   * Creates an instance of WxSFM.
   * @param {string} source
   * @param {Request} request
   * @param {WxSFM.Options} baseOptions
   * @memberof WxSFM
   */
  constructor (source: string, public request: Request, public baseOptions: WxSFM.Options) {
    this.source = (source || '').trim()
    this.rawSource = this.source
    this.destExt = baseOptions.destExt
    this.initDest()
    this.initReference()
  }

  /**
   * 是否.wxa扩展，同Request.isWxa
   *
   * @readonly
   * @memberof WxSFM
   */
  get isWxa () {
    return this.request.isWxa
  }

  /**
   * 是否.wxp扩展，同Request.isWxp
   *
   * @readonly
   * @memberof WxSFM
   */
  get isWxp () {
    return this.request.isWxp
  }

  /**
   * 是否.wxc扩展，同Request.isWxc
   *
   * @readonly
   * @memberof WxSFM
   */
  get isWxc () {
    return this.request.isWxc
  }

  /**
   * 是否单文件类型，同Request.isSFC
   *
   * @readonly
   * @memberof WxSFM
   */
  get isSFC () {
    return this.request.isSFC
  }

  /**
   * 返回通过新的扩展名与 request.dest的目标绝对路径生成新的 dest目标绝对路径 和 destRelative目标相对路径
   *
   * @param {string} ext
   * @returns
   * @memberof WxSFM
   */
  getDester (ext: string) {
    let ppath = path.parse(this.request.dest)
    ppath.base = ppath.name + ext
    ppath.ext = ext
    let dest = path.format(ppath)
    let destRelative = path.relative(config.cwd, dest)
    return {
      dest,
      destRelative
    }
  }

  // 生成
  async generator (): Promise<string> {
    log.fatal('WxSFM.generator Method not implemented.')
    return ''
  }

  // 保存前
  beforeSave (): void {
    //
  }

  // 保存
  save (): void {
    this.beforeSave()
    this.generator()
      .then(this.saveContent.bind(this))
      .catch(err => {
        core.util.error(err)
        xcxNext.add(this.request)
      })
    this.afterSave()
  }

  // 保存后
  afterSave (): void {
    //
  }

  // 移除前
  beforeRemove (): void {
    //
  }

  // 移除
  remove (): void {
    this.beforeRemove()
    log.msg(LogType.DELETE, this.destRelative)
    util.unlink(this.dest)
    this.afterRemove()
  }

  // 移除后
  afterRemove (): void {
    //
  }

  // 获取依赖
  getDepends (): Depend[] {
    log.fatal('WxSFM.getDepends Method not implemented.')
    return []
  }

  // 更新依赖
  updateDepends (uses: Request.Core[]): void {
    log.fatal('WxSFM.updateRequest Method not implemented.')
  }

  // 获取隐式引用，例如 less 预编译语言的代码里 import 了外部文件、单文件模块的 src 外部文件
  getImplicitReferences (): string[] {
    return this.implicitReferences
  }

  // 添加隐式引用
  addImplicitReferences (value: string | string[]): void {
    if (core.util.isArray(value)) {
      this.implicitReferences = this.implicitReferences.concat(value)
    } else {
      this.implicitReferences.push(value)
    }
  }

  /**
   * 将内容写入到 dest目标绝对路径
   *
   * @private
   * @param {string} content
   * @memberof WxSFM
   */
  async saveContent (content: string) {
    let options: PluginHelper.Options = {
      cwd: config.cwd,
      filename: this.destRelative,
      extend: {
        content
      }
    }

    let plugin = new PluginHelper(PluginHelper.Type.Text)
    let result = await plugin.apply(options)
    let { extend = {} } = result
    content = extend.content || ''

    await core.util.writeFile(this.dest, content)
    log.msg(LogType.WRITE, this.destRelative)
  }

  /**
   * 设置 dest目标绝对路径 和 destRelative目标相对路径
   *
   * @private
   * @memberof WxSFM
   */
  private initDest () {
    let dester = this.getDester(this.destExt)
    this.dest = dester.dest
    this.destRelative = dester.destRelative
  }

  private initReference () {
    let { referenceSrc } = this.baseOptions

    this.dependParent = referenceSrc || this.request.src

    if (referenceSrc) {
      this.addImplicitReferences(referenceSrc)
    }
  }
}
