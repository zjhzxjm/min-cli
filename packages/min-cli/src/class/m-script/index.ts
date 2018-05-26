import { Request } from '../Request'
import { BaseScript } from './BaseScript'
import { NativeScript } from './NativeScript'
import { WxScript } from './WxScript'
import { WxaScript } from './WxaScript'
import { WxpScript } from './WxpScript'
import { WxcScript } from './WxcScript'

export {
  BaseScript,
  NativeScript,
  WxScript,
  WxaScript,
  WxpScript,
  WxcScript
}

export function createWxScript (source: string, request: Request, options: BaseScript.Options) {
  let $WxScript: typeof WxScript

  if (request.isWxa) {
    $WxScript = WxaScript
  } else if (request.isWxp) {
    $WxScript = WxpScript
  } else if (request.isWxc) {
    $WxScript = WxcScript
  }

  return new $WxScript(source, request, options)
}

export function createScript (source: string, request: Request, options: BaseScript.Options) {
  if (request.isSFC) {
    return createWxScript(source, request, options)
  }

  return new NativeScript(source, request, options)
}
