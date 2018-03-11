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
      config: {
        px: 1,
        rem: 100
      }
    }
  }
}
```
