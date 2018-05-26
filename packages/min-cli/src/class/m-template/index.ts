import { Request } from '../Request'
import { BaseTemplate } from './BaseTemplate'
import { NativeTemplate } from './NativeTemplate'
import { WxTemplate } from './WxTemplate'
import { WxaTemplate } from './WxaTemplate'
import { WxpTemplate } from './WxpTemplate'
import { WxcTemplate } from './WxcTemplate'

export {
  BaseTemplate,
  NativeTemplate,
  WxTemplate,
  WxaTemplate,
  WxpTemplate,
  WxcTemplate
}

export function createWxTemplate (source: string, request: Request, options: BaseTemplate.Options) {
  let $WxTemplate: typeof WxTemplate

  if (request.isWxa) {
    $WxTemplate = WxaTemplate
  } else if (request.isWxp) {
    $WxTemplate = WxpTemplate
  } else if (request.isWxc) {
    $WxTemplate = WxcTemplate
  }

  return new $WxTemplate(source, request, options)
}

export function createTemplate (source: string, request: Request, options: BaseTemplate.Options) {
  if (request.isSFC) {
    return createWxTemplate(source, request, options)
  }

  return new NativeTemplate(source, request, options)
}
