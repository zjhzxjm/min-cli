# min plugin-filesync

## 安装

``` bash
$ npm install @mindev/min-plugin-filesync --save-dev
```

## 配置 `min.config.js`

``` js
interface Config {
  cwd: String
  from: String | Array,
  to: String,
  filter: RegExp,
  validate: Function
  force: Boolean,
  ignore: String | Array
}
```

``` js
module.exports = {
  plugins: {
    filesync: {
      cwd: 'assets'
      from: ['**/*'],
      to: 'img/',
      filter: /\.png$/,
      validate (filename: string) {
        return true
      }
      force: true,
      ignore: ['*.jpg']
    },

    // or
    filesync: {
      img: {
        cwd: 'assets'
        from: '**/*',
        to: '/'
      },
      wxFile: {
        cwd: 'pages'
        from: '**/*',
        filter: /index\.(wxml|wxss|js|json)$/,
        to: '/'
      }
    },

    // or
    filesync: [
      // for img
      {
        cwd: 'assets'
        from: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.webp'],
        to: '/'
      },
      // for wxFile
      {
        cwd: 'pages'
        from: ['**/*.wxml', '**/*.wxss', '**/*.js', '**/*.json'],
        to: '/'
      }
    ]
  }
}
```

## 参数说明

## Tip

- min cli 2.x 版本开始支持
