import { Request } from '../Request'
import { BaseStyle } from './BaseStyle'
import { NativeStyle } from './NativeStyle'
import { WxStyle } from './WxStyle'
import { WxaStyle } from './WxaStyle'
import { WxpStyle } from './WxpStyle'
import { WxcStyle } from './WxcStyle'

export {
  BaseStyle,
  NativeStyle,
  WxStyle,
  WxaStyle,
  WxpStyle,
  WxcStyle
}

export function createWxStyle (source: string, request: Request, options: BaseStyle.Options) {
  let $WxStyle: typeof WxStyle

  if (request.isWxa) {
    $WxStyle = WxaStyle
  } else if (request.isWxp) {
    $WxStyle = WxpStyle
  } else if (request.isWxc) {
    $WxStyle = WxcStyle
  }

  return new $WxStyle(source, request, options)
}

export function createStyle (source: string, request: Request, options: BaseStyle.Options) {
  if (request.isSFC) {
    return createWxStyle(source, request, options)
  }

  return new NativeStyle(source, request, options)
}
