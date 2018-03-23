# min plugin-unit2rpx

## 安装

``` bash
$ npm install @mindev/min-plugin-unit2rpx --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    unit2rpx: {
      filter: new RegExp('\.(wxss)$'),
      validate (options: PluginHelper.Options) {
        return true
      },
      config: {
        px: 1,
        rem: 100
      }
    }
  }
}
```

## Tip

- min cli 2.x 版本开始支持
