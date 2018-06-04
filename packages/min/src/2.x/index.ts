import createApp from './app'
import createPage from './page'
import createComponent from './component'
import Min from './class/Min'
import $global, { Global } from './global'

export default Min
export const App = createApp
export const Page = createPage
export const Component = createComponent
export const global = $global
