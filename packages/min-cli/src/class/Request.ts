import * as _ from 'lodash'
import * as changeCase from 'change-case'
import { RequestType } from '../declare'
import { config, resolveDep } from '../util'

export namespace Request {

  /**
   * 选项
   *
   * @export
   * @interface Options
   */
  export interface Options {
    /**
     * 地址，通常以.(点)、alias(别名)、npm（包名称）开始的相对路径，当isMain选项值为真时则允许为绝对路径
     *
     * @type {string}
     * @memberof Options
     */
    request: string,

    /**
     * 类型
     *
     * @type {string}
     * @memberof Options
     */
    requestType?: RequestType

    /**
     * 父src源文件地址
     *
     * @type {string}
     * @memberof Options
     */
    parent?: string,

    /**
     * 是否为主入口文件，默认为false
     *
     * @type {boolean}
     * @memberof Options
     */
    isMain?: boolean,

    /**
     * 是否为发布组件，它仅用于 min publish 发布组件传入真值，请求依赖的目标路径将保留 src 部分，它不做dest路径替换
     *
     * @type {boolean}
     * @memberof Options
     */
    isPublish?: boolean

    /**
     * 是否来自第三方NPM
     *
     * @type {boolean}
     * @memberof Options
     */
    isThreeNpm?: boolean
  }

  /**
   * 基础
   *
   * @export
   * @interface Default
   */
  export interface Default {
    /**
     * 地址
     *
     * @type {string}
     * @memberof Default
     */
    request: string

    /**
     * 类型
     *
     * @type {RequestType}
     * @memberof Default
     */
    requestType: RequestType

    /**
     * 虚拟文件
     *
     * @type {Boolean}
     * @memberof Default
     */
    isVirtual?: Boolean
  }

  /**
   * 路径
   *
   * @export
   * @interface Path
   */
  export interface Path {

    /**
     * 源绝对地址
     *
     * @type {string}
     * @memberof Path
     */
    src: string

    /**
     * 源相对地址
     *
     * @type {string}
     * @memberof Path
     */
    srcRelative: string

    /**
     * 源扩展名
     *
     * @type {string}
     * @memberof Path
     */
    ext: string

    /**
     * 目标绝对地址
     *
     * @type {string}
     * @memberof Path
     */
    dest: string

    /**
     * 目标相对地址
     *
     * @type {string}
     * @memberof Path
     */
    destRelative: string

    /**
     * 是否来自第三方NPM
     *
     * @type {boolean}
     * @memberof Core
     */
    isThreeNpm: boolean
  }

  /**
   * 核心
   *
   * @export
   * @interface Core
   * @extends {Request.Default} 基础
   * @extends {Request.Path} 路径
   */
  export interface Core extends Default, Path {}

  /**
   * 扩展
   *
   * @export
   * @interface Extend
   */
  export interface Extend {
    /**
     * 是否单文件类型，比如.wxa .wxp .wxc，当isWxa isWxp isWxc 三者中值存在真时它就为真
     *
     * @type {boolean}
     * @memberof Extend
     */
    isSFC: boolean

    isWxa: boolean
    isWxp: boolean
    isWxc: boolean

    /**
     * 是否原生文件类型，理论上非单文件类型的都属于原生文件，当isTemplate isScript isStyle 三者中值存在真时它就为真
     *
     * @type {boolean}
     * @memberof Extend
     */
    isNFC: boolean

    /**
     * 是否模板文件类型，比如.wxml .pug等
     *
     * @type {boolean}
     * @memberof Extend
     */
    isTemplate: boolean

    isWxml: boolean
    isPug: boolean

    /**
     * 是否脚本文件类型，比如.js .ts .wxs等
     *
     * @type {boolean}
     * @memberof Extend
     */
    isScript: boolean

    isJs: boolean
    isTs: boolean
    isWxs: boolean

    /**
     * 是否为样式文件类型，比如.css .wxss .less .pcss .postcss .sass .scss .styl .stylus等
     *
     * @type {boolean}
     * @memberof Extend
     */
    isStyle: boolean

    isCss: boolean
    isWxss: boolean
    isLess: boolean
    isPcss: boolean
    isPostcss: boolean
    isSass: boolean
    isScss: boolean
    isStyl: boolean
    isStylus: boolean

    // JSON
    isJson: boolean

    /**
     * 是否为图片文件类型，比如.png .jpg .jpeg .gif .bmp .webp
     *
     * @type {boolean}
     * @memberof Extend
     */
    isImage: boolean

    isPng: boolean
    isJpg: boolean
    isJpeg: boolean
    isGif: boolean
    isBmp: boolean
    isWebp: boolean

    /**
     * 是否为图标字体文件，比如.eot .svg .ttf .woff
     *
     * @type {boolean}
     * @memberof Extend
     */
    isIconFont: boolean

    isEot: boolean
    isSvg: boolean
    isTtf: boolean
    isWoff: boolean
  }
}

/**
 * 请求核心类
 *
 * @export
 * @class RequestCore
 * @implements {Request.Core}
 */
export class RequestCore implements Request.Core {
  request: string
  requestType: RequestType
  src: string
  srcRelative: string
  ext: string
  dest: string
  destRelative: string
  /**
   * 是否来自第三方NPM
   *
   * @type {boolean}
   * @memberof RequestCore
   */
  isThreeNpm: boolean

  /**
   * Creates an instance of RequestCore.
   * @param {Request.Options} options
   * @memberof RequestCore
   */
  constructor (options: Request.Options) {
    // 通过resolveDep的请求依赖分析方法，将结果合并到RequestCore实例
    _.merge(this, resolveDep(options))
  }
}

/**
 * 请求扩展类
 *
 * @export
 * @class RequestExtend
 * @extends {RequestCore}
 * @implements {Request.Extend}
 */
export class RequestExtend extends RequestCore implements Request.Extend {
  // SFC
  isWxa: boolean
  isWxp: boolean
  isWxc: boolean

  // TEMPLATE
  isWxml: boolean
  isPug: boolean

  // SCRIPT
  isJs: boolean
  isTs: boolean
  isWxs: boolean

  // STYLE
  isCss: boolean
  isWxss: boolean
  isLess: boolean
  isPcss: boolean
  isPostcss: boolean
  isSass: boolean
  isScss: boolean
  isStyl: boolean
  isStylus: boolean

  // JSON
  isJson: boolean

  // IMAGE
  isPng: boolean
  isJpg: boolean
  isJpeg: boolean
  isGif: boolean
  isBmp: boolean
  isWebp: boolean

  // ICONFONT
  isEot: boolean
  isSvg: boolean
  isTtf: boolean
  isWoff: boolean

  /**
   * 是否单文件类型
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isSFC () {
    return this.isWxa || this.isWxp || this.isWxc
  }

  /**
   * 是否原生文件类型
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isNFC () {
    return this.isTemplate || this.isScript || this.isStyle
  }

  /**
   * 是否模板文件类型
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isTemplate () {
    return this.isWxml || this.isPug
  }

  /**
   * 是否脚本文件类型
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isScript () {
    return this.isJs || this.isTs || this.isWxs
  }

  /**
   * 是否样式文件类型
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isStyle () {
    return this.isCss || this.isWxss ||
      this.isLess ||
      this.isPcss || this.isPostcss ||
      this.isSass || this.isScss ||
      this.isStyl || this.isStylus
  }

  /**
   * 是否为静态文件（无依赖、无编译）
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isStatic () {
    return this.isJson || this.isImage || this.isIconFont
  }

  /**
   * 是否为图片文件
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isImage () {
    return this.isPng ||
      this.isJpg ||
      this.isJpeg ||
      this.isGif ||
      this.isBmp ||
      this.isWebp
  }

  /**
   * 是否为图标字体文件
   *
   * @readonly
   * @memberof RequestExtend
   */
  get isIconFont () {
    return this.isEot || this.isSvg || this.isTtf || this.isWoff
  }

  /**
   * Creates an instance of RequestExtend.
   * @param {Request.Options} options
   * @memberof RequestExtend
   */
  constructor (options: Request.Options) {
    super(options)

    // 通过扩展名，取得key值
    let key = _.findKey(config.ext, value => value === this.ext)
    if (key) {
      // 通过 key 值，设置实例中对应字段的真值，其余都为假值
      this[`is${changeCase.pascalCase(key)}`] = true
    }
  }
}

/**
 * 请求类
 *
 * @export
 * @class Request
 * @extends {RequestExtend}
 */
export class Request extends RequestExtend {
  constructor (options: Request.Options) {
    super(options)
  }
}
