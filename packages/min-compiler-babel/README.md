# min babel 编译器

## 安装

``` bash
$ npm install @mindev/min-compiler-babel --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  compilers: {
    babel: {
      sourceMaps: 'inline',
      presets: [
        'env'
      ],
      plugins: [
        'syntax-export-extensions',
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-export-extensions'
      ]
    }
  }
}
```

## 参数说明

[Babel](https://github.com/babel/babel)

## Tip

- min cli 2.x 版本开始支持
