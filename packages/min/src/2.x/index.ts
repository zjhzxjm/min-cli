import minApp from './app'
import minPage from './page'
import minComponent from './component'
import Min from './min'
import $global, { Global } from './global'

export default {
  global: $global,
  use: Min.use,
  mixins: Min.mixin
}

export const App = minApp
export const Page = minPage
export const Component = minComponent
