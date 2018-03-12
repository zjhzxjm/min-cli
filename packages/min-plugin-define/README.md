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
      PRODUCTION: JSON.stringify(true),
      VERSION: JSON.stringify("5fa3b9"),
      BROWSER_SUPPORTS_HTML5: true,
      TWO: {}
    }
  }
}
```

## 参数说明
