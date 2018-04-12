export interface Config {
  warnHandler?: Function,
  errorHandler?: Function,
  silent: boolean,
  optionMergeStrategies: {
    [key: string]: Function
  }
}

const config: Config = {
  // warnHandler: () => {},
  errorHandler: () => {},
  silent: false,
  optionMergeStrategies: {}
}

export default config
