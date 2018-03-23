# min plugin-filemin

## 安装

``` bash
$ npm install @mindev/min-plugin-filemin --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    filemin: {
      filter: new RegExp('\.(wxml|xml|wxss|json)$'),
      validate (options: PluginHelper.Options) {
        return true
      },
      config: {}
    }
  }
}
```

## Tip

- min cli 2.x 版本开始支持
