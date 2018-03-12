# min plugin-sdk

## 安装

``` bash
$ npm install @mindev/min-plugin-sdk --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    sdk: {
      filter: /\.wxss$/,
      config: {}
    }
  }
}
```

## 参数说明
