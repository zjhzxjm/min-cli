export function forEachObjValue (obj: any, fn: Function) {
  return Object.keys(obj).forEach(key => fn(obj[key], key));
}

export function isPromise (obj: any): boolean {
  return obj && obj.then === 'function';
}

export function transformToArray (path: string | string[]) {
  return Array.isArray(path) ? path : (path.includes('/') ? path.split('/') : [path]);
}