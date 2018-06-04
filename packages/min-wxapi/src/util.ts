export const isArray = (v: any) => Array.isArray(v)
export const isFunction = (v: any) => typeof v === 'function'
export const isUndefined = (v: any) => typeof v === 'undefined'
export const noop = function () {}

export const filterWxApiOptions = (wxApiName, wxApiOptions): string => {
  if (wxApiName === 'request') {
    wxApiOptions = (typeof (wxApiOptions) === 'string')
      ? { url: wxApiOptions }
      : wxApiOptions
  }

  return wxApiOptions
}
