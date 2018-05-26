import { Request } from '../Request'
import { BaseTemplate } from './BaseTemplate'

export namespace WxTemplate {
  export interface Options extends BaseTemplate.Options {

  }
}

export class WxTemplate extends BaseTemplate {
  constructor (source: string, request: Request, options: WxTemplate.Options) {
    super(source, request, options)
  }
}
