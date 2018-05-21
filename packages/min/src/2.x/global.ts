export interface Global {
  $app?: App.Context

  _nextTicks?: Function[]
}

const $global: Global = {
  _nextTicks: []
}

export default $global
