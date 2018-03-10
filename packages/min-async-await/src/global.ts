const global = typeof window !== 'undefined' && window.Math === Math
  ? window
  : typeof self !== 'undefined' && self.Math === Math ? self : this

export default global
