import { isUndefined } from './util'

const global = !isUndefined(window) && window.Math === Math
  ? window
  : !isUndefined(self) && self.Math === Math
    ? self
    : this

export default global
