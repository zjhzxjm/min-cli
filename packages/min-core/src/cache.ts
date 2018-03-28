export default {
  _config: Object.create(null),

  getConfig () {
    return this._config || null
  },

  setConfig (value = null) {
    this._config = value
  }
}
