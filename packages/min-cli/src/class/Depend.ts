import * as babel from 'babel-core'
import * as postcss from 'postcss'
import { Request } from './Request'
import { RequestType } from '../declare'

import t = babel.types

/**
 * 依赖类型集合
 */
export type Depend = Depend.Template | Depend.TemplateImage | Depend.Wxs | Depend.Script | Depend.Style | Depend.StyleIconFont | Depend.Wxc | Depend.Wxp | Depend.Json

export namespace Depend {

  export interface Default extends Request.Default {
    parent: string
  }

  export interface Template extends Default {
    requestType: RequestType.TEMPLATE,
    $elem: any // for htmlparse2
  }

  export interface TemplateImage extends Default {
    requestType: RequestType.IMAGE,
    $elem: any // for htmlparse2
  }

  export interface Wxs extends Default {
    requestType: RequestType.WXS,
    $elem?: any // for htmlparse2
    $node?: t.StringLiteral // for babel
  }

  /**
   * 依赖JS类型的接口
   *
   * @export
   * @interface Script
   * @extends {Default}
   */
  export interface Script extends Default {
    requestType: RequestType.SCRIPT
    $node: t.StringLiteral // for babel
  }

  /**
   * 依赖json类型的接口
   *
   * @export
   * @interface Json
   * @extends {Default}
   */
  export interface Json extends Default {
    requestType: RequestType.JSON,
    $node: t.StringLiteral // for babel
  }

  /**
   * 依赖STYLE类型的接口
   *
   * @export
   * @interface Style
   * @extends {Default}
   */
  export interface Style extends Default {
    requestType: RequestType.STYLE
    $atRule: postcss.AtRule // for postcss
  }

  export interface StyleIconFont extends Default {
    requestType: RequestType.ICONFONT,
    $decl: postcss.Declaration // for postcss
  }

  /**
   * 依赖WXC类型的接口
   *
   * @export
   * @interface Wxc
   * @extends {Default}
   */
  export interface Wxc extends Default {
    requestType: RequestType.WXC
    usingKey: string // for wxc
  }

  /**
   * 依赖WXP类型的接口
   *
   * @export
   * @interface Wxp
   * @extends {Default}
   */
  export interface Wxp extends Default {
    requestType: RequestType.WXP
    usingKey: string // for wxp
  }
}
