export default {
  onLoad () {
    console.log('init loading')
  },

  onShow () {
    this.$loading = this.selectComponent('#loading')
  },

  methods: {
    showLoading () {
      this.$loading.show()
    },
    hideLoading () {
      this.$loading.hide()
    }
  }
}
