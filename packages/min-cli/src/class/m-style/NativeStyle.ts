import { Request } from '../Request'
import { BaseStyle } from './BaseStyle'

export class NativeStyle extends BaseStyle {
  constructor (source: string, request: Request, options: BaseStyle.Options) {
    super(source, request, options)
  }
}
