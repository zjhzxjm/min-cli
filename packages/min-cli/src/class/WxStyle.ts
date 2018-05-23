import * as url from 'url'
import * as path from 'path'
import * as postcss from 'postcss'
import { Depend, Request, WxSFM } from '../class'
import { RequestType } from '../declare'
import util, { log, config, Global, ICONFONT_PATTERN } from '../util'
import core, { loader, CompilerHelper } from '@mindev/min-core'

export namespace WxStyle {

  export interface Options {

    /**
     * 预编译语言
     *
     * @type {string}
     * @memberof Options
     */
    lang: string

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
 * STYLE 模块类
 *
 * @export
 * @class WxStyle
 * @extends {WxSFM}
 */
export class WxStyle extends WxSFM {

  /**
   * PostCSS 处理器的结果
   *
   * @private
   * @type {postcss.Result}
   * @memberof WxStyle
   */
  private result: postcss.Result = null

  /**
   * 依赖列表
   *
   * @private
   * @type {Depend[]}
   * @memberof WxStyle
   */
  private depends: Depend[] = []

  /**
   * Creates an instance of WxStyle.
   * @param {string} source
   * @param {Request} request
   * @param {WxStyle.Options} options
   * @memberof WxStyle
   */
  constructor (source: string, request: Request, public options: WxStyle.Options) {
    super(source, request, {
      destExt: config.ext.wxss,
      referenceSrc: options.referenceSrc
    })

    this.initDepends()
  }

  /**
   * 生成代码
   *
   * @returns {Promise<string>}
   * @memberof WxStyle
   */
  async generator (): Promise<string> {
    let source = this.source
    let { lang = 'wxss' } = this.options

    if (!lang) {
      return source
    }

    if (lang === 'wxss') {
      if (this.result) {
        source = await postcss().process(this.result).then(result => result.css)
      }
      return source
    }

    if (lang === 'pcss') {
      lang = 'postcss'
    } else if (lang === 'styl') {
      lang = 'stylus'
    }

    let compilerConfig = config.compilers[lang]

    if (lang === 'sass' || lang === 'scss') {
      let indentedSyntax = false
      compilerConfig = Object.assign({}, config.compilers['sass'] || {})

      if (lang === 'sass') { // sass is using indented syntax
        indentedSyntax = true
        let indent = core.util.getIndent(source)
        if (indent.firstLineIndent) {
          source = core.util.fixIndent(source, indent.firstLineIndent * -1, indent.char)
        }
      }
      if (compilerConfig.indentedSyntax === undefined) {
        compilerConfig.indentedSyntax = indentedSyntax
      }

      lang = 'sass'
    }

    let compiler = loader.loadCompiler(lang)

    if (!compiler) {
      throw new Error(`未发现相关 ${lang} 编译器配置，请检查min.config.js文件或尝试运行命令 "npm install @mindev/min-compiler-${lang} --save-dev" 进行安装.`)
    }

    source = this.appendVariables(source, lang)

    let result = await compiler({
      cwd: config.cwd,
      filename: this.options.referenceSrc || this.request.src,
      config: compilerConfig,
      extend: {
        code: source
      }
    })
    let { extend: { code = '', imports = [] } = {} } = result

    this.addImplicitReferences(imports)

    return code
  }

  /**
   * 获取依赖列表
   *
   * @returns {Depend[]}
   * @memberof WxStyle
   */
  getDepends (): Depend[] {
    return this.depends
  }

  /**
   * 更新依赖列表
   *
   * @param {Request.Core[]} useRequests 可用的请求列表
   * @memberof WxStyle
   */
  updateDepends (useRequests: Request.Core[]): void {
    let depends = this.getDepends()

    if (!depends.length) return

    useRequests.forEach(useRequest => {
      depends
      .filter(depend => {
        return depend.requestType === useRequest.requestType && depend.request === useRequest.request
      })
      .forEach(depend => {
        let request = ''
        request = path.relative(path.dirname(this.dest), path.dirname(useRequest.dest))
        request = path.join(request, path.basename(useRequest.dest, useRequest.ext))
        request = request.charAt(0) !== '.' ? `./${request}` : request
        request = request.split(path.sep).join('/')

        switch (depend.requestType) {
          case RequestType.STYLE:
            // ② 更新依赖引用路径，将所有的扩展名统一改成 .wxss
            depend.$atRule.params = `'${request}${config.ext.wxss}'`
            break

          case RequestType.ICONFONT:
            let requestURL = url.parse(depend.request)
            // depend.request => ./iconfont.eot?t=1515059114217
            // depend.$decl.value => url('./iconfont.eot?t=1515059114217')
            depend.$decl.value = depend.$decl.value.replace(depend.request, `${request}${useRequest.ext}${requestURL.search}`)
            break
        }
      })
    })
  }

  private appendVariables (source: string, lang: string) {
    let {
      config: {
        style: {
          withAtSymbolVariables,
          withDollarSymbolVariables,
          noWithSymbolVariables
        }
      }
    } = Global

    switch (lang) {
      case 'less':
        {
          source = withAtSymbolVariables + '\n' + source
        }
        break

      case 'postcss':
        {
          source = withDollarSymbolVariables + '\n' + source
        }
        break

      case 'sass':
        {
          source = withDollarSymbolVariables + '\n' + source
        }
        break

      case 'stylus':
        {
          source = noWithSymbolVariables + '\n' + source
        }
        break
    }
    return source
  }

  /**
   * 初始化 depends 依赖列表
   *
   * @private
   * @memberof WxStyle
   */
  private initDepends () {
    if (!this.source) return
    let { lang = 'wxss' } = this.options

    if (lang !== 'wxss') return

    let transformer: postcss.Transformer = root => {
      // @import
      root.walkAtRules((rule, index) => {
        if (rule.name !== 'import') {
          return
        }
        // ① 收集所有的依赖，用于后续的依赖加载和路径更新
        this.depends.push({
          parent: this.dependParent,
          request: rule.params.replace(/^('|")(.*)('|")$/g, (match, quotn, filename) => filename),
          requestType: RequestType.STYLE,
          $atRule: rule
        })
      })

      // background background-image
      root.walkDecls((decl, index) => {
        // WXSS 里不用本地资源
        // background background-image => IMAGE
        // decl.prop !== 'background' && decl.prop !== 'background-image'

        // src => ICONFONT
        if (decl.prop !== 'src') {
          return
        }

        // src: url('./iconfont.eot?t=1515059114217');
        if (decl.value.indexOf('url') === -1) {
          return
        }

        // src: url('./iconfont.eot?t') format('embedded-opentype'), /* IE6-IE8 */
        //      url('./iconfont.ttf?t=1515059114217') format('truetype')
        let urls = decl.value.split(/format\([\'\"][a-z-]+[\'\"]\),/)

        urls.forEach(url => {
          let matchs = url.match(ICONFONT_PATTERN)
          if (!matchs) {
            return
          }

          // url('./iconfont.eot?t=1515059114217#iefix')
          url = matchs[1]

          // Check local file
          if (!util.checkLocalFile(url)) {
            return
          }

          this.depends.push({
            parent: this.dependParent,
            request: url,
            requestType: RequestType.ICONFONT,
            $decl: decl
          })
        })
      })
    }
    let lazyResult = postcss([transformer]).process(this.source)
    lazyResult.toString()

    this.result = lazyResult['result']
  }
}

// import wxss 保留引用，不被插件编译
// class ImportWxssPlugin {
//   pick: postcss.Plugin<any>
//   revert: postcss.Plugin<any>

//   private atRules: postcss.AtRule[] = []

//   constructor () {
//     this._pick()
//     this._revert()
//   }

//   /**
//    * 摘取 @import *.wxss 扩展的路径引用
//    *
//    * @private
//    * @memberof ImportWxssPlugin
//    */
//   private _pick() {
//     this.pick = postcss.plugin('postcss-plugin-pick-import-wxss', () => {
//       return root => {
//         root.walkAtRules((rule, index) => {
//           if (rule.name === 'import' && /\.wxss('|")$/.test(rule.params)) {
//             root.removeChild(rule)
//             this.atRules.push(rule)
//           }
//         })
//       }
//     })
//   }

//   /**
//    * 归还 @import *.wxss 扩展的路径引用
//    *
//    * @private
//    * @memberof ImportWxssPlugin
//    */
//   private _revert() {
//     this.revert = postcss.plugin('postcss-plugin-revert-import-wxss', () => {
//       return root => {
//         if (root.nodes && this.atRules.length > 0) {
//           root.prepend(this.atRules)
//         }
//       }
//     })
//   }
// }
