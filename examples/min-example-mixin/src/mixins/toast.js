export default {
  onLoad () {
    console.log('init toast')
  },

  onShow () {
    this.$toast = this.selectComponent('#toast')
  },

  methods: {
    showToast () {
      this.$toast.show()
    },
    hideToast () {
      this.$toast.hide()
    }
  }
}
