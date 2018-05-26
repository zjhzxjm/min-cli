import { Request } from '../Request'
import { WxTemplate } from './WxTemplate'

export class WxcTemplate extends WxTemplate {
  constructor (source: string, request: Request, options: WxTemplate.Options) {
    super(source, request, options)
    this.initDom()
    this.initElem()
    this.initDepend()
  }
}
