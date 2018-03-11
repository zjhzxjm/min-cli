# min postcss 编译器

## 安装

``` bash
$ npm install @mindev/min-compiler-postcss --save-dev
```


## 配置 `min.config.js`

``` js
import bem from 'postcss-bem'
import calc from 'postcss-calc'
import precss from 'precss'

module.exports = {
  compilers: {
    postcss: {
      plugins: [
        bem,
        precss,
        calc
      ]
    }
  }
}
```

## 参数说明

[Postcss](https://github.com/postcss/postcss)

## 插件

[PostCSS Plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md)
[PostCSS.parts](https://www.postcss.parts/)
