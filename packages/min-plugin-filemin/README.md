# min plugin-filemin

## 安装

``` bash
$ npm install @mindev/min-plugin-filemin --save-dev
```

## 配置`min.config.js`

``` js
{
  plugins: {
    filemin: {
      filter: /\.(wxml|xml|wxss|json)$/
    }
  }
}
```
