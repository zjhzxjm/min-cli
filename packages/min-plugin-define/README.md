# min plugin-define

## 安装

``` bash
$ npm install @mindev/min-plugin-define --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    define: {
      validate (options: PluginHelper.Options) {
        return true
      },
      config: {
        PRODUCTION: JSON.stringify(true),
        VERSION: JSON.stringify("5fa3b9"),
        BROWSER_SUPPORTS_HTML5: true,
        TWO: {}
      }
    }
  }
}
```

## 参数说明

## Tip

- min cli 2.x 版本开始支持
