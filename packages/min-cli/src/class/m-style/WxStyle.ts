import { Request } from '../Request'
import { BaseStyle } from './BaseStyle'

export namespace WxStyle {
  export interface Options extends BaseStyle.Options {

  }
}

export class WxStyle extends BaseStyle {
  constructor (source: string, request: Request, options: WxStyle.Options) {
    super(source, request, options)
  }
}
