# min plugin-uglifyjs

## 安装

``` bash
$ npm install @mindev/min-plugin-uglifyjs --save-dev
```

## 配置`min.config.js`

``` js
{
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
