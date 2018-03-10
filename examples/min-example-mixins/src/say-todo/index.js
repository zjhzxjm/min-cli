module.exports = {
  onLoad () {
    console.log('init todo')
  },

  onShow () {
    console.log('onShow in todo')
  },

  onHide () {
    console.log('onHide in todo')
  },

  methods: {
    sayTodo (name) {
      wx.showToast({
        title: `say todo`
      })
      console.log(`${name} say todo`)
    }
  }
}



