# min plugin-uglifyjs

## 安装

``` bash
$ npm install @mindev/min-plugin-uglifyjs --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    uglifyjs: {
      filter: new RegExp('\.(js)$'),
      config: {
        compress: {
          warnings: false
        },
        fromString: true
      }
    }
  }
}
```

## 参数说明

[UglifyJS](https://github.com/mishoo/UglifyJS2)
