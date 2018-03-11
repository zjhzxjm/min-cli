# min plugin-imagemin

## 安装

``` bash
$ npm install @mindev/min-plugin-imagemin --save-dev
```

## 配置`min.config.js`

``` js
{
  plugins: {
    imagemin: {
      filter: new RegExp('\.(jpg|png|jpeg)$'),
      config: {
        jpg: {},
        png: {
          quality: '65-80'
        }
      }
    }
  }
}
```
