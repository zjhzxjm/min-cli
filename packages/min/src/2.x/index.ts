import minApp from './app'
import minPage from './page'
import minComponent from './component'
import Min from './min'
import $global, { Global } from './global'

// export default {
//   global: $global,
//   use: Min.use.bind(Min),
//   mixin: Min.mixin.bind(Min)
// }

export default Min

export const App = minApp
export const Page = minPage
export const Component = minComponent
export const global = $global
