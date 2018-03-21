import { RequestType } from '../declare'
import { config } from '../util'

const { ext } = config

/**
 * 请求类型与扩展名的匹配
 */
export const LangTypes: {
  [name: string]: RequestType
} = {
  // SFC
  [ext.wxa]: RequestType.WXA,
  [ext.wxp]: RequestType.WXP,
  [ext.wxc]: RequestType.WXC,

  // TEMPLATE
  [ext.wxml]: RequestType.TEMPLATE,
  [ext.pug]: RequestType.TEMPLATE,

  // SCRIPT
  [ext.js]: RequestType.SCRIPT,
  [ext.ts]: RequestType.SCRIPT,

  // WXS
  [ext.wxs]: RequestType.WXS,

  // STYLE
  [ext.css]: RequestType.STYLE,
  [ext.wxss]: RequestType.STYLE,
  [ext.less]: RequestType.STYLE,
  [ext.pcss]: RequestType.STYLE,
  [ext.postcss]: RequestType.STYLE,
  [ext.sass]: RequestType.STYLE,
  [ext.scss]: RequestType.STYLE,
  [ext.styl]: RequestType.STYLE,
  [ext.stylus]: RequestType.STYLE,

  // JSON
  [ext.json]: RequestType.JSON,

  // IMAGE
  [ext.png]: RequestType.IMAGE,
  [ext.jpg]: RequestType.IMAGE,
  [ext.jpeg]: RequestType.IMAGE,
  [ext.gif]: RequestType.IMAGE,
  [ext.bmp]: RequestType.IMAGE,
  [ext.webp]: RequestType.IMAGE,

  // ICON
  [ext.eot]: RequestType.ICONFONT,
  [ext.svg]: RequestType.ICONFONT,
  [ext.ttf]: RequestType.ICONFONT,
  [ext.woff]: RequestType.ICONFONT
}
