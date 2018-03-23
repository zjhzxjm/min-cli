# min plugin-autoprefixer

## 安装

``` bash
$ npm install @mindev/min-plugin-autoprefixer --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    autoprefixer: {
      filter: new RegExp('\.(wxss)$'),
      validate (options: PluginHelper.Options) {
        return true
      },
      config: {
        browsers: ['Android >= 2.3', 'Chrome > 20', 'iOS >= 6']
      }
    }
  }
}
```

## 参数说明

[autoprefixer](https://github.com/postcss/autoprefixer#options)

## Tip

- min cli 2.x 版本开始支持
