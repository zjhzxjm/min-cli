
// can we use __proto__?
export const hasProto = '__proto__' in {}

// @ts-ignore
// Firefox has a "watch" function on Object.prototype...
export const nativeWatch = ({}).watch

/* istanbul ignore next */
export function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

let _Set
/* istanbul ignore if */ // $flow-disable-line
// @ts-ignore
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  // @ts-ignore
  _Set = Set
}
else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set implements SimpleSet {
    set: Object
    constructor () {
      this.set = Object.create(null)
    }
    has (key: string | number) {
      return this.set[key] === true
    }
    add (key: string | number) {
      this.set[key] = true
    }
    clear () {
      this.set = Object.create(null)
    }
  }
}

interface SimpleSet {
  has (key: string | number): boolean
  add (key: string | number): any
  clear (): void
}

export { _Set }
export { SimpleSet }
