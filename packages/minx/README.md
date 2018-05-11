root的结构
root: {
  state: { // 按路径(namespace)合并了子modules里的state
    id0
    id1
    a: {
      id2
    }
    a/b: {
      id3
    }
  },
  getters: { // 合并了子modules里的state（暂未支持namespace）
    getterId0
    getterId1
    getterId2
    getterId3
  },
  actions: { // 合并了子modules里的actions（暂未支持namespace）
    actionId0
    actionId1
  },
  mutations: { // 合并了子modules里的mutations（暂未支持namespace）
    mutationId0
    mutationId1
  }
  ...
}

mapState
store里的state不是函数
1、
computed:
{
  ...mapState([
    'a' // 对应this.$store.state.a
  ])
}
2、
computed:{
  ...mapState({
    count: state => state.count,
    countAlias: 'count', // 重命名；'count' 等同于 `state => state.count`
    countPlusLocalState (state) { // 为了能够使用 `this` 获取局部状态，必须使用常规函数
      return state.count + this.localCount
    }
  })
}

mapGetters
store里的getters本就都是函数
1、
computed:{
  ...mapGetters([
    'a' // 对应this.$store.getters.a
  ])
}
2、
computed:{
  ...mapGetters({
    countAlias: 'count', // 重命名；对应this.$store.state.count
  })
}

mapMutations
1、
methods:{
  ...mapMutations([
    'add', // 将 `this.add()` 映射为 `this.$store.commit('add')`
    'add2' // 支持传参；调用时用`this.add2(data)` 会映射为 `this.$store.commit('add2', data)`
  ])
}
2、
methods: {
  ...mapMutations({
    add: 'addOnce', // 将 `this.add()` 映射为 `this.$store.commit('addOnce')`
    addFunc (commit, data) { // 会把commit作为第一个参数回传
      ...
    }
  })
}

调用
a、未使用mapMutations时的调用姿势：
this.$store.commit('add', {
  a,
  b
})
b、使用后调用姿势：
this.add({
  a,
  b
})
this.addFunc({
  a,
  b
})

测试
http://www.liuyiqi.cn/2017/11/09/how-to-test-dom-manipulation/