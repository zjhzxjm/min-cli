# Min

> Min2.0 优化原生小程序支持 mixin、wx.api promise化、intercept 拦截器、似vue的computed、watch等

## 安装

- **CLI工具**

``` bash
$ npm i -g @mindev/min-cli@2.0.0-beta.1
```

- **基础库**

``` bash
$ cd ~/your_project_dir
$ npm i --save @minlib/min
$ npm i --save @minlib/min-async-await
```

## 创建项目

- [创建小程序应用](https://meili.github.io/min/docs/min-cli/app-project/index.html)
- [创建小程序组件库](https://meili.github.io/min/docs/min-cli/wxc-project/index.html)

`注：` 已有小程序项目可跳过此步骤，请前往 从 Min 1.x 迁移到 2.x 升级文档

## 初始化

- **app.wxa**

``` js
import '@minlib/min-async-await'
import min from '@minlib/min'
```

``` js
// Initialize the configuration for min.
min.init({
  global: true, // 设置 min 为全局变量
  promisify: true, // wx.api promise 化
  requestfix: true // wx.request 优化并发次数限制
})
```

## 使用

### 一、使用 mixins

- **定义一个 sayHello mixin 对象**

``` js
// ~/mixins/sayHello.js
export default {
  onShow () {
    console.log('onShow in sayHello')
  },

  onHide () {
    console.log('onHide in sayHello')
  },

  methods: {
    sayHello (name) {
      wx.showToast({
        title: `say hello`
      })
      console.log(`${name} say hello`)
    }
  }
}

```

- **在任何的 .wxp 文件里混入**

```html
// ~/pages/home/index.wxp
<template>
  <!-- 省略... -->
</template>

<script>
  import sayHello from  './mixins/sayHello'

  // min.Page 是页面构造器
  // min 对象是由 min.init({global: true}) 设置可全局访问的
  export default min.Page({
    mixins: [sayHello],

    onShow () {
      this.sayHello('lingxiao')
    }
  })
</script>

<style>
  /* 省略... */
</style>
```

### 二、注册全局 Components、mixins

> 将公共基础组件放置全局模板内，并提供全局的mixins函数，通过 min dev 编译后让每个页面都能直接控制其组件实例

- **安装示例中用到的 MinUI 组件**

``` bash
$ cd ~/your_project_dir
$ npm install --save @minui/wxc-loading
$ npm install --save @minui/wxc-toast
```

- **创建 mixin**

``` js
// 这里以 loading mixin 举例
// ~/mixins/loading.js
export default {
  onLoad () {
    console.log('init loading')
  },

  onShow () {
    // 获取组件实例
    this.$loading = this.selectComponent('#loading')
  },

  methods: {
    // 定义一个显示 loading 的 mixin 函数
    showLoading () {
      this.$loading.show()
    },
    // 定义一个隐藏 loading 的 mixin 函数
    hideLoading () {
      this.$loading.hide()
    }
  }
}
```

- **在 app.wxa 内放置公共模板、注册全局 Components 和 mixins**

``` html
// 全局模板
<template>
  <view>
    <!-- wxp template -->
    <page></page>

    <!-- global component -->
    <wxc-loading id="loading"></wxc-loading>
    <wxc-toast id="toast"></wxc-toast>
  </view>
</template>

// app.js 逻辑 和 app.json 配置，以及包括 globalMin 配置。
<script>
import loading from './mixins/loading'
import toast from './mixins/toast'
export default {
    // app.json 配置
    config: {
      ...
    },
    // 全局 min 配置，包括组件 和 mixins
    globalMin: {
      // 经 min dev 编译后合并到每个 page.json 的配置
      config: {
        // 注册组件
        usingComponents: {
          'wxc-loading': '@minui/wxc-loading',
          'wxc-toast': '@minui/wxc-toast'
        }
      },
      // 经 min dev 编译后混入到每个 page.js 的 mixins
      mixins: [loading, toast]
    },
    ...
  }
</script>

<style>
  /* 省略... */
</style>
```

- **在任意的 .wxp 里可直接访问**

> 经 min dev 编译后，全局 mixins 已混入到各个 .wxp 页面中

``` js
export default min.Page({
  onShowLoading () {
    // 调用 ~/mixins/loading.js 中的 showLoading 方法
    this.showLoading() // 显示 loading

    setTimeout(() => {
      this.hideLoading() // 隐藏 loading
    }, 2000)
  },
  onHideLoading () {
    // 调用 ~/mixins/loading.js 中的 hideLoading 方法
    this.hideLoading() // 隐藏 loading
  }
})
```

### wx.api 的 promise 化

> 所有 wx.api 接口可通过 min.api 访问，并支持异步接口 promise 化

``` js
export default min.Page({
  methods: {
    async getData () {

      try {
        // wx.request 用 min.request 代替 ，支持promise
        let data = await min.request({
          url: 'http://mce.mogucdn.com/ajax/get/3?pid=104985'
        })
        console.log(data)
      } catch (err) {
        console.err('request error：', err)
      }
    }
  }
})
```

## min.intercept 拦截器

``` js
// Add a min.request interceptor.
min.intercept('request', {
    // 发出请求前的回调函数
    before (config, api) {
        // 对所有request请求中的OBJECT参数对象统一附加时间戳属性
        config.timestamp = +new Date();
        console.log('request config: ', config)
        return config
    },

    // 请求成功后的回调函数
    success (res, config, api) {
        // 可以在这里对收到的响应数据对象进行加工处理
        console.log('request success: ', res)
        return res
    },

    //请求失败后的回调函数
    fail (err, config, api) {
        console.log('request fail: ', err)
        return err
    },

    // 请求完成时的回调函数(请求成功或失败都会被执行)
    complete (res, config, api) {
        console.log('request complete: ', res)
        return res
    },
})
```

## ChangeLog

- **2.0.0**
  - 支持 mixins
  - 支持 全局访问 min 变量
  - 支持 全局注册 Component、mixins
  - 支持 min.api 接口 promise 化
  - 支持 min.intercept 拦截器
  - 优化 wx.request 并发次数限制

## Todo

- **2.0.1**
  - computed
  - watch

## Tip

- promisify: true 支持 wx.api promise 化，前提是依赖 `@minlib/min-async-await`
