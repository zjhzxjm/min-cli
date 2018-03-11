# min plugin-autoprefixer

## 安装

``` bash
$ npm install @mindev/min-plugin-autoprefixer --save-dev
```

## 配置`min.config.js`

``` js
{
  plugins: {
    autoprefixer: {
      filter: /\.wxss$/,
      config: {
        browsers: ['Android >= 2.3', 'Chrome > 20', 'iOS >= 6']
      }
    }
  }
}
```
