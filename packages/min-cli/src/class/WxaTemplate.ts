import { Request } from './Request'
import { WxTemplate } from './WxTemplate'

export class WxaTemplate extends WxTemplate {
  constructor (source: string, request: Request, options: WxTemplate.Options) {
    super(source, request, options)

    this.initSource()
  }
}
