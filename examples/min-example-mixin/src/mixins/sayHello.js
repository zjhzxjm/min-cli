export default {
  onLoad () {
    console.log('init sayHello')
  },

  onShow () {
    console.log('onShow in sayHello 22 www2222   2222')
  },

  onHide () {
    console.log('onHide in sayHello')
  },

  methods: {
    sayHello (name) {
      wx.showToast({
        title: `say hello`
      })
      console.log(`${name} say hello`)
    }
  }
}

const sayGood = {
  methods: {
    sayGood (name) {
      wx.showToast({
        title: `say good`
      })
      console.log(`${name} say good`)
    }
  }
}

const sayBye = {
  methods: {
    sayBye (name) {
      wx.showToast({
        title: `say bye`
      })
      console.log(`${name} say bye`)
    }
  }
}

export {
  sayGood,
  sayBye
}
