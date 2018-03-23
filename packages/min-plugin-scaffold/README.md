# min plugin-scaffold

## 安装

``` bash
$ npm install @mindev/min-plugin-scaffold --save-dev
```

## 配置 `min.config.js`

``` js
module.exports = {
  plugins: {
    scaffold: {
      filter: new RegExp('\.ext$'),
      validate (options: PluginHelper.Options) {
        return true
      },
      config: {}
    }
  }
}
```

## 参数说明

## Tip

- min cli 2.x 版本开始支持
