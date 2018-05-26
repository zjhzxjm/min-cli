import { Request } from '../Request'
import { WxTemplate } from './WxTemplate'
import core from '@mindev/min-core'

export class WxaTemplate extends WxTemplate {
  constructor (source: string, request: Request, options: WxTemplate.Options) {
    super(source, request, options)
  }

  save () {
    //
  }
}
