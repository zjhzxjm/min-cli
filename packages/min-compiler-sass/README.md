# min sass 编译器

## 安装

``` bash
$ npm install @mindev/min-compiler-sass --save-dev
```


## 配置 `min.config.js`

``` js
module.exports = {
  compilers: {
    sass: {
      outputStyle: 'compressed'
    }
  }
}
```

## 参数说明

[node-sass](https://github.com/sass/node-sass)

## Tip

- min cli 2.x 版本开始支持
- 不支持 alias 别名
