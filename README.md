# Min Cli

> 令小程序组件的开发和使用变得愉悦


## ○ 最佳实践

[MinUI](https://github.com/meili/minui)，是基于 Min 平台产出的一套 UI 组件库，同时也是蘑菇街小程序在应用的 UI 组件库。通过下面的小程序二维码，可以在手机中体验 MinUI（微信基础库版本 1.6.3 以上支持）：

![](http://s3.mogucdn.com/mlcdn/c45406/171103_5l89d0ih87eh9e715065310ekgdea_220x220.png)

## ○ 环境安装

``` bash
$ npm install -g @mindev/min-cli
```

## ○ 组件开发

### ☞ 初始化组件开发环境

``` bash
$ cd ~/your-custom-project
$ min init

# 创建完毕后，执行下 $ min dev，生成 dist/ 目录。
# 在 "微信开发者工具" 中新建一个小程序项目，项目目录指向 dist/。如此，组件就能在开发者工具中进行预览了。
```

### ☞ 新建组件

``` bash
$ min new *name
```

### ☞ 调试组件

通过设置一个组件名 *name，来开启组件的调试。任何组件的改动，都会触发实时编译，并在 "微信开发者" 工具中显示改动后的效果。

``` bash
$ min dev *name
```

``` bash
# 支持英文逗号分隔，来同时调试多个组件
$ min dev *name1 *name2

# 无组件名，则监听整个工程环境的改动
$ min dev
```

### ☞ 发布组件

发布后的组件即为一个随时可用的 npm 包：

``` bash
# 例如发布 loading 组件
$ cd ~/your-weapp-project/packages/wxc-loading
$ npm publish

# 发布 scope 的 npm 包到外网，需带上 `--access=public`
$ npm publish --access=public
```

> 其实也可以采用 `$ min publish` 方法发布组件，支持单个发布和批量发布，支持自动升级版本号、远程仓库更新推送、自动打 tag 等。只不过某些情况下还有点小坑，最近几天会解决。如果您看到本文档时这段话还存在，可以先选择上面的 npm publish 方式发布 :p

## ○ 组件应用

### ☞ 安装组件

在小程序项目中安装一个组件，这里用 [MinUI](https://github.com/meili/minui) 的 loading 和 toast 组件举例：

``` bash
$ cd ~/your-weapp-project
$ min install @minui/wxc-loading
```

批量安装：

``` bash
$ min install @minui/wxc-loading @minui/wxc-tast
```

注：通过 `min install` 安装组件NPM包后同 npm install 一样放入到 node_modules 目录下，此时cli会将其进行编译并保存到小程序开发的目录下，默认在 `dist/packages` 目录下，用户可以进行自定义设置，使用姿势参考如下：

在 ~/you-weapp-project 目录下，有个 min.config.json 配置文件，如果不存在将其创建

``` json
{
  "npm": {
    "dest": "custom-path"
  }
}
```

### ☞ 使用组件

按照微信小程序组件化文档所示，引入组件并使用即可。

使用已注册的自定义组件前，首先要在页面的 `json` 文件中进行引用声明。此时需要提供每个自定义组件的标签名和对应的自定义组件文件路径：

```json
{
  "usingComponents": {
    "component-tag-name": "path/to/the/custom/component"
  }
}
```

注：在不同场景下用户提供的自定义组件文件路径存在区别。场景1)在已有的小程序应用里使用自定义组件，用户提供的文件路径必须是相对于当前文件，并指向到 min install 组件编译后的保存路径，上面的演示代码所示；场景2)通过 min init 创建小程序应用，用户提供的文件路径可以是场景1的使用姿势，也可以是一个组件NPM包名称，在 min dev 构建过程中会将其更改为NPM包编译后的保存路径，这里用 [MinUI](https://github.com/meili/minui) 的 loading 组件举例

```json
{
  "usingComponents": {
    "wxc-loading": "@minui/wxc-loading"
  }
}
```

这样，在页面的 `wxml` 中就可以像使用内置组件一样使用自定义组件。节点名即自定义组件的标签名，节点属性即传递给组件的属性值。

**代码示例：**

```html
<view>
  <!-- 以下是对一个自定义组件的引用 -->
  <component-tag-name inner-text="Some text"></component-tag-name>
</view>
```

自定义组件的 `wxml` 节点结构在与数据结合之后，将被插入到引用位置内。

### ☞ 更新组件

``` bash
# 全部更新
$ min update

# 选择性更新
$ min update @minui/wxc-loading @minui/wxc-tast
```

## ○ 开源协议

本项目基于 [MIT](http://opensource.org/licenses/MIT) License，请自由的享受、参与开源。

## ○ 更新记录

### v1.0.5（2017.12.12）

- 新增 组件安装支持导出多个入口
- 新增 使用 min install/update/build 命令时增加 “是否启用 es6 转 es5” 选项
- 新增 使用 min build 命令编译依赖组件，增加“请设置编译后的保存路径” 选项
- 修复 在 less 里使用 “运算符” 转换问题
- 修复 在 less 里使用 “@import” 找不到文件错误


### v1.0.4（2017.11.29）

- 新增 支持es6/es7新特性
- 新增 支持创建空scope名称的组件
- 修复 引用wxc组件路径依赖分析错误问题
- 优化 脚手架首页模板换成@minui/wxc-example-menu导航菜单组件
- 优化 min init 初始化项目
    - npm.dest 相对于 dest 目录下，避免因目标路径不在同一个目录下导致无法访问
    - 完善验证错误信息提示，增加多层用户输入校验
    - 增加创建组件选项
- 优化 min new 创建组件的规则校验，只能包括小写字母，支持“-”分隔
- 优化 config配置，包括scope和prefix


### v1.0.3（2017.11.16）

- 修复windows系统下wxa文件的全局模板编辑后没有重新编译所有页面问题
- 修复import第三方npm包解析找不到模块问题
- 修复标签属性转为小写问题

### v1.0.2（2017.11.10）

- 修复 windows 系统兼容问题（min init 初始化项目安装失败；min dev 生成页面路径错误；其他问题）
- 增加 min install | update 支持自定义设置安装后的保存路径
- 修复 tabbar 的 iconPath 路径强制依赖问题
- 修复 package 组件的 README.md 文件编辑后没有实时编译示例页面的文档
- 修复 min xxx -h 没有打印 help 信息
- 优化 min dev 调试多个页面命令行参数使用英文逗号分隔，暂不支持空格分隔，min install 和 min update存在同样的问题
- 修复 min update 命令行缺少参数报错

### v1.0.1（2017.11.02）

- 初始版本
