import Min from 'vue/dist/vue.common'
import Minx from '../src/core.ts'
Min.use(Minx)

const Store = Minx.Store

describe('Store CASE', () => {
  it('installModules', () => {
    const store = new Store({
      state: {
        count: 0
      },
      modules: {
        a: {
          state: {
            count: 1
          },
          modules: {
            a_a: {
              state: {
                count: '1_1'
              }
            }
          }
        },
        b: {
          state: {
            count: 2
          }
        }
      }
    })
    expect(store._modules.root.state).toEqual({
      count: 0,
      a: {
        count: 1,
        a_a: {
          count: '1_1'
        }
      },
      b: {
        count: 2
      }
    })
  })

  it('commit', () => {
    const ADD = 'add'
    const store = new Store({
      state: {
        count: 0
      },
      mutations: {
        [ADD] (state, data) {
          state.count += data.count || data
        }
      }
    })

    store.commit(ADD, 1)
    expect(store.state.count).toBe(1)

    store.commit(ADD, {
      count: 1
    })
    expect(store.state.count).toBe(2)
  })

  it('dispatch sync', () => {
    const ADD = 'add'
    const ADD_SYNC = 'addSync'
    const store = new Store({
      state: {
        count: 0
      },
      mutations: {
        [ADD] (state, data) {
          state.count += data.count || data
        }
      },
      actions: {
        [ADD_SYNC] ({commit}, data) {
          commit(ADD, data)
        }
      }
    })
    store.dispatch(ADD_SYNC, {
      count: 1
    })
    expect(store.state.count).toBe(1)
  })

  it('dispatch async', () => {
    const ADD = 'add'
    const ADD_ASYNC = 'addAsync'
    const store = new Store({
      state: {
        count: 0
      },
      mutations: {
        [ADD] (state, data) {
          state.count += data.count || data
        }
      },
      actions: {
        [ADD_ASYNC] ({commit}, data) {
          setTimeout(() => {
            commit(ADD, data)
            expect(store.state.count).toBe(1)
          }, 100)
        }
      }
    })

    store.dispatch(ADD_ASYNC, {
      count: 1
    })
  })

  it('dispatch promise', () => {
    const ADD = 'add'
    const ADD_ASYNC = 'addAsync'
    const store = new Store({
      state: {
        count: 0
      },
      mutations: {
        [ADD] (state, data) {
          state.count += data.count || data
        }
      },
      actions: {
        [ADD_ASYNC] ({commit}, data) {
          return new Promise(resolve => {
            setTimeout(() => {
              commit(ADD, data)
              resolve()
            }, 100)
          })
        }
      }
    })

    expect(store.state.count).toBe(0)
    return store.dispatch(ADD_ASYNC, {
      count: 1
    }).then(() => {
      expect(store.state.count).toBe(1)
    })
  })

  // it('dispatch async/await', async () => {
  //   const ADD = 'add'
  //   const store = new Store({
  //     state: {
  //       count: 0
  //     },
  //     mutations: {
  //       [ADD] (state, data) {
  //         state.count += data.count || data
  //       }
  //     },
  //     actions: {
  //       test1 ({commit}, data) {
  //         return new Promise(resolve => {
  //           setTimeout(() => {
  //             commit(ADD, data)
  //             resolve()
  //           }, 100)
  //         })
  //       },
  //       async test2 ({ dispatch, commit }, data) {
  //         await dispatch('test1', data)
  //         commit(ADD, data)
  //       }
  //     }
  //   })

  //   await store.dispatch('test2', 100)
  //   expect(store.state.count).toBe(200)
  // })

  it('getters', () => {
    const store = new Store({
      state: {
        count: 0
      },
      getters: {
        name: (state) => {
          return state.count > 0 ? 'big' : 'small'
        }
      },
      modules: {
        moduleA: {
          state: {
            a: 'child module'
          },
          getters: {
            b: state => `${state.a} getters`
          }
        }
      },
      mutations: {
        add (state) {
          state.count++
        }
      },
      actions: {
        testGetter ({getters, state}, value) {
          expect(getters.name).toBe(value)
        }
      }
    })
    expect(store.getters.name).toBe('small')
    store.commit('add')
    store.dispatch('testGetter', 'big')

    expect(store.state.moduleA.a).toBe('child module')
    expect(store.getters.b).toBe('child module getters')
  })

  it('watch', done => {
    const store = new Store({
      state: {
        count: 1
      },
      getters: {
        price: state => () => state.count > 1 ? 'big' : 'small'
      },
      mutations: {
        'add' (state, data) {
          state.count += data
        }
      }
    })

    setTimeout(() => {
      store.commit('add', 1)
      done()
    }, 100)
    store.watch(store.getters.price, (newVal, oldVal) => {
      console.log('watch price')
      expect(newVal).toBe('big')
    })
  })

  it('install module', () => {
    const store = new Store({
      state: {
        count: 0
      }
    })

    store.install(['moduleA'], {
      state: {
        count: 1
      }
    })

    expect(store.state).toEqual({
      count: 0,
      moduleA: {
        count: 1
      }
    })
  })

  it('uninstall module', () => {
    const store = new Store({
      state: {
        count: 0
      },
      modules: {
        a: {
          state: {
            count: 1,
          },
          modules: {
            aa: {
              state: {
                count: 2
              }
            }
          }
        }
      }
    })

    expect(store.state).toEqual({
      count: 0,
      a: {
        count: 1,
        aa: {
          count: 2
        }
      }
    })
    store.uninstall('a/aa')
    expect(store.state).toEqual({
      count: 0,
      a: {
        count: 1
      }
    })
  })
})
