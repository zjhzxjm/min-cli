import { isPlainObject } from '../shared/util'

/**
 * Check if a string starts with $ or _
 */
export function isReserved (str: string): boolean {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

function pathFormat (path) {
  // list[0] => list.0
  path = path.replace(/\[([\d]+)\]/g, '.$1')

  // list['length']
  // path = path.replace(/\[(['"])([^'"]*)\1\]/g, '.$2')

  return path
}

/**
 * Parse simple path.
 */
const bailRE = /[^\w.$]/
export function parsePath (path: string, format?: boolean): Function {

  if (format) {
    path = pathFormat(path)
  }

  if (bailRE.test(path)) {
    return
  }

  const segments = path.split('.')
  return function (obj, target = null) {
    let key

    for (let i = 0; i < segments.length; i++) {
      if (!obj) return

      key = segments[i]
      obj = obj[key]

      if (target && obj !== undefined) {

        if (target[key] === undefined || (Array.isArray(target) && key === 'length')) {
          if (i === segments.length - 1) {
            target[key] = obj
          }
          else if (isPlainObject(obj) || Array.isArray(obj)) {
            target[key] = isPlainObject(obj) ? {} : []
          }
        }

        target = target[key]
      }

    }
    return obj
  }
}
