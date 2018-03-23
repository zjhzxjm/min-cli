import { Config } from './declare'

const scope = '@minui'

const config: Config = {
  clear: true,
  app: true,
  title: 'MinUI',
  cli: 'min',
  filename: 'min.config.js',
  projectType: '', // in customConfig. include min.config.json and minConfig of package.json
  cwd: process.cwd(),
  prefix: 'wxc',
  src: 'src',
  dest: 'dist',
  pages: '{{src}}/pages',
  packages: 'packages', // wxc组件项目目录
  package: { // wxc组件
    src: 'src', // 源路径
    dest: 'dist', // 编译路径
    default: 'index' // 默认文件
  },
  homePage: 'pages/home/index', // 默认首页
  layout: {
    placeholder: '<page></page>' // 模板页面站位符
  },
  npm: { // 依赖 npm 包
    scope,
    src: 'node_modules', // 源路径
    dest: '{{dest}}/{{packages}}'
    // dest: { // 编译路径
    //   modules: 'dist/min',
    //   wxcs: 'dist/min'
    // }
  },
  alias: {
    'common': '{{src}}/common', // 公共
    'layout': '{{src}}/common/layout', // 布局
    'assets': '{{src}}/common/assets', // 资源
    'components': '{{src}}/common/components', // 组件

    'pages': '{{pages}}' // 页面

    // 默认由 util.config 实现
    // [scope]: '{{packages}}' // 组件库
  },
  resolveId: {},
  resolveVirtual: {},
  ext: { // 扩展名
    // SFC
    wxa: '.wxa',
    wxp: '.wxp',
    wxc: '.wxc',

    // TEMPLATE
    wxml: '.wxml',
    pug: '.pug',

    // SCRIPT
    js: '.js',
    ts: '.ts',
    wxs: '.wxs',

    // STYLE
    css: '.css',
    wxss: '.wxss',
    less: '.less',
    pcss: '.pcss',
    postcss: '.postcss',
    sass: '.sass',
    scss: '.scss',
    styl: '.styl',
    stylus: '.stylus',

    // JSON
    json: '.json',

    // IMAGE
    png: '.png',
    jpg: '.jpg',
    jpeg: '.jpeg',
    gif: '.gif',
    bmp: '.bmp',
    webp: '.webp',

    // ICONFONT
    eot: '.eot',
    svg: '.svg',
    ttf: '.ttf',
    woff: '.woff'
  },
  structure: { // 构造器
    wxc: 'Component',
    wxp: 'Page',
    wxa: 'App'
  },
  compilers: {},
  plugins: {},
  lint: {},
  log: {
    verbose: true, // 显示详细信息
    time: true, // 显示时间
    level: 0 // 日志级别
  },
  cache: {
    // file: '.xcxcache',
    // xcxast: '.xcxcache'
  }
}

export default config
