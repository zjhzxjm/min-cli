# min plugin-imagemin

## 安装

``` bash
$ npm install @mindev/min-plugin-imagemin --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    imagemin: {
      filter: new RegExp('\.(jpg|png|jpeg)$'),
      validate (options: PluginHelper.Options) {
        return true
      },
      config: {
        jpg: {},
        png: {
          quality: '65-80'
        },
        webp: {
          quality: 50
        }
      }
    }
  }
}
```

## 参数说明

[imagemin](https://github.com/imagemin/imagemin)
