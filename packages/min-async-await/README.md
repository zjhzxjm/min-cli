# Min 中使用 async/await

> 可以让异步逻辑用同步写法实现，用同步写法代替传统的callback嵌套

## 安装

- **async-await**

``` bash
$ npm install @minlib/min-async-await --save
```

- **babel**

``` bash
$ npm install babel-preset-env --save-dev
$ npm install babel-plugin-syntax-export-extensions --save-dev
$ npm install babel-plugin-transform-export-extensions --save-dev
```

## 引用

- **app.wxa**

``` js
import '@minlib/min-async-await';
```

## 配置babel编译器

- **min.config.js**

``` js
module.exports = {
  compilers: {
    babel: {
      presets: [
        'env'
      ],
      'plugins': [
        'syntax-export-extensions',
        'transform-export-extensions'
      ]
    }
  }
}
```

## 配置小程序开发者工具

- **关闭 es6 转 es5**

## Links

- [Min 中使用 async/await](https://meili.github.io/min/docs/features/babel.html)
- [Min 组件化解决方案](https://github.com/meili/min)
- [MinUI 小程序UI组件库](https://github.com/meili/minui)

## 其他

注：Min 2.x 版本开始，@mindev/min-async-function 已弃用
