import * as postcss from 'postcss'

let unit2rpx = postcss.plugin('min-plugin-unit2rpx', (config: any) => {
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

export default async (code: string, config: any): Promise<string> => {
  let processor = await postcss([
    unit2rpx(config)
  ])
  return processor.process(code).then(result => result.css)
}
