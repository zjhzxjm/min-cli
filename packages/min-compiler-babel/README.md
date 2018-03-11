# min babel 编译器

## 安装

```
npm install @mindev/min-compiler-babel --save-dev
```


## 配置`min.config.js`

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
