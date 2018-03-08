export const isArray = (v: any) => Array.isArray(v)
export const isFunction = (v: any) => typeof v === 'function'
export const noop = function () {}

export const filterWxApiOptions = (wxApiName, wxApiOptions): string => {
  if (wxApiName === 'request') {
    wxApiOptions = (typeof (wxApiOptions) === 'string')
      ? { url: wxApiOptions }
      : wxApiOptions
  }

  return wxApiOptions
}

export const mixMethods = (config: Config) => {
  let { methods = {} } = config

  // Get methods
  Object.keys(methods).forEach(key => {
    let method = methods[key]

    // Ignore not Function
    if (!isFunction(method)) return

    config[key] = method
  })

  return config
}
