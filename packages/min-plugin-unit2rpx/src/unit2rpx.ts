import * as postcss from 'postcss'
import { DEFAULTS } from './const'

let unit2rpx = postcss.plugin('min-plugin-unit2rpx', (config: MinPluginUnit2Rpx.Config = DEFAULTS.config) => {
  return root => {
    root.walkRules((rule, index) => {
      root.walkDecls(decl => {
        decl.value = decl.value.replace(/([0-9.]+)(px|rem)/ig, (match: string, size: number, unit: string) => {

          if (unit === 'px') { // 100px => 100rpx
            return `${ size * config.px }rpx`
          }

          else if (unit === 'rem') { // 1rem => 100rpx
            return `${ size * config.rem }rpx`
          }

          return match
        })
      })
    })
  }
})

export default async (code: string, config: MinPluginUnit2Rpx.Config): Promise<string> => {
  let processor = await postcss([
    unit2rpx(config)
  ])
  return processor.process(code).then(result => result.css)
}
