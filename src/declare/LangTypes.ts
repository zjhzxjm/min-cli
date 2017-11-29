import { RequestType, CompileType } from '../declare'
import { config } from '../util'

const { ext } = config

/**
 * 请求类型与扩展名的匹配
 */
export const LangTypes: {
  [name: string]: {
    requestType: RequestType,
    compileType?: CompileType
  }
} = {
  // SCRIPT
  [ext.js]: {
    requestType: RequestType.SCRIPT,
    compileType: undefined
  },

  // STATIC
  [ext.json]: {
    requestType: RequestType.STATIC,
    compileType: undefined
  },

  // TEMPLATE
  [ext.wxml]: {
    requestType: RequestType.TEMPLATE,
    compileType: undefined
  },

  // STYLE
  [ext.wxss]: {
    requestType: RequestType.STYLE,
    compileType: undefined
  },
  [ext.less]: {
    requestType: RequestType.STYLE,
    compileType: CompileType.LESS
  },
  [ext.pcss]: {
    requestType: RequestType.STYLE,
    compileType: CompileType.PCSS
  },

  // SFC
  [ext.wxa]: {
    requestType: RequestType.WXA,
    compileType: undefined
  },
  [ext.wxp]: {
    requestType: RequestType.WXP,
    compileType: undefined
  },
  [ext.wxc]: {
    requestType: RequestType.WXC,
    compileType: undefined
  }
}
