# min plugin-copy

## 安装

``` bash
$ npm install @mindev/min-plugin-copy --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    copy: {
      filter: new RegExp('\.(jpg|png|jpeg)$'),
      config: {}
    }
  }
}
```

## 参数说明
