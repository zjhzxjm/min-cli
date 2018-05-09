import { isUndefined } from './util'

// @ts-ignore
const global = !isUndefined(window) && window.Math === Math
  ? window
  // @ts-ignore
  : !isUndefined(self) && self.Math === Math
    ? self
    : this

export default global
