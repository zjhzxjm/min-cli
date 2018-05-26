import { Request } from '../Request'
import { WxStyle } from './WxStyle'

export class WxaStyle extends WxStyle {
  constructor (source: string, request: Request, options: WxStyle.Options) {
    super(source, request, options)
  }
}
