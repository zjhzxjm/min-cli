export default {
  methods: {
    getData() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            status: 'resolve'
          })
        }, 2000)
      })
    }
  }
}
