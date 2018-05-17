export {
  beautifyHtml,
  beautifyCss,
  beautifyJs
} from './beautify'

export { filterPrefix, filterNpmScope } from './filter'

export { config, customConfig, defaultConfig } from './config'

export { xcxCache, xcxNext } from './cache'

export { getText, getInnerHTML, getOuterHTML} from './dom-serializer'
export { dom } from './dom'

export { exec } from './exec'

export * from './git-user'

export { Global } from './global'

export { eslint } from './lint'

export { log, LogType, LogLevel } from './log'

export { md } from './md'
export * from './renderExps'

export { resolveDep, src2destRelative } from './resolveDep'

export const ICONFONT_PATTERN = /url\([\'\"]{0,}?([^\'\"]*)[\'\"]{0,}\)/

import * as tool from './tool'
export default tool
