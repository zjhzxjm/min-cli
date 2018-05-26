import todo from './todo'

const count = 1000

export default {
  data: {
    count,
    todo: todo.list
  },
  onBeforeLoad () {
    console.log('onBeforeLoad in about')
  },
  onLoad () {
    console.log('onLoad in about')
  },
  onAfterLoad () {
    console.log('onAfterLoad in about')
  },
  onShow () {
    console.log('onShow in about')

    setInterval(() => {
      this.todo.push({
        id: this.todo.length + 1,
        name: 'cds'
      })
    }, 1000)
  },
  onShowLoading () {
    this.showLoading()
    setTimeout(() => {
      // this.hideLoading()
      this.$loading.hide()
    }, 2000)
  },
  onSayHello () {
    this.sayHello('lingxiao')
  }
}
