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

const bemOptions = {
  defaultNamespace: undefined,
  style: 'suit',
  separators: {
    descendent: '__',
    modifier: '--'
  },
  shortcuts: {
    utility: 'u',
    component: 'b',
    descendent: 'e',
    modifier: 'm',
    when: 'is'
  }
}

module.exports = {
  compilers: {
    postcss: {
      plugins: [
        bem(bemOptions),
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

## Tip

- min cli 2.x 版本开始支持
- 支持 postcss ^5.2.5 版本的插件
- 不支持 alias 别名
