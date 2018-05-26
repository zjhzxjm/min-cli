import createApp from './app'
import createPage from './page'
import createComponent from './component'
import Min from './min'
import $global, { Global } from './global'

// export default {
//   global: $global,
//   use: Min.use.bind(Min),
//   mixin: Min.mixin.bind(Min)
// }

export default Min

export const App = createApp
export const Page = createPage
export const Component = createComponent
export const global = $global
