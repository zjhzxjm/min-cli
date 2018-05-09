export default {
  map: {},
  mq: [],
  running: [],
  MAX_REQUEST: 10,

  push (options) {
    options.t = +new Date()
    while ((this.mq.indexOf(options.t) > -1 || this.running.indexOf(options.t) > -1)) {
      options.t += Math.random() * 10 >> 0
    }
    this.mq.push(options.t)
    this.map[options.t] = options
  },

  next () {
    let me = this

    if (this.mq.length === 0) {
      return
    }

    if (this.running.length >= this.MAX_REQUEST - 1) {
      return
    }

    let newone = this.mq.shift()
    let options = this.map[newone]
    let preComplete = options.complete
    options.complete = (...args) => {
      me.running.splice(me.running.indexOf(options.t), 1)
      delete me.map[options.t]
      preComplete && preComplete.apply(options, args)
      me.next()
    }
    this.running.push(options.t)
    return wx.request(options)
  },

  request (options = {}) {
    options = (typeof (options) === 'string')
      ? { url: options }
      : options

    this.push(options)

    return this.next()
  }
}
