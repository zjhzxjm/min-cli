import { Request } from '../Request'
import { BaseTemplate } from './BaseTemplate'

export class NativeTemplate extends BaseTemplate {
  constructor (source: string, request: Request, options: BaseTemplate.Options) {
    super(source, request, options)
    this.initDom()
    this.initElem()
    this.initDepend()
  }
}
