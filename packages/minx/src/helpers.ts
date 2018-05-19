import { forEachObjValue } from './common/utils'

export const mapState = (state: string[] | any) => {
  const res = {}
  formatter(state).forEach(function ({key, val}) {
    res[key] = function (this: any) {
      // this->组件实例
      const state = this.$store.state
      const getters = this.$store.getters
      return typeof val === 'function' ? val.call(this, state, getters) : state[val]
    }
  })

  return res
}

export const mapGetters = (getters: string[] | any) => {
  const res = {}
  formatter(getters).forEach(function ({key, val}) {
    res[key] = function (this: any) {
      // this->组件实例
      if (!this.$store.getters[val]) {
        return
      }
      return this.$store.getters[val]
    }
  })

  return res
}

export const mapMutations = (mutations: string[] | any) => {
  const res = {}
  formatter(mutations).forEach(function ({key, val}) {
    res[key] = function (this: any, ...data: any[]) {
      // this->组件实例
      const commit = this.$store.commit
      return typeof val === 'function' ? val.apply(this, [commit].concat(data)) : commit.apply(this.$store, val.concat(data))
    }
  })
}

export const mapActions = (actions: string[] | any) => {
  const res = {}
  formatter(actions).forEach(({key, val}) => {
    res[key] = function (this: any, ...data: any[]) {
      const dispatch = this.$store.dispacth
      return typeof val === 'function' ? val.apply(this, [dispatch].concat(data)) : dispatch.apply(this.$store, val.concat(data))
    }
  })
}

/**
 * @param handlerList
 * @return {key, val}
 * [1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * {a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 */
const formatter = (handlerList: string[] | any): Array<any> => {
  if (!handlerList) {
    return []
  }

  return Array.isArray(handlerList) ?
    handlerList.map(val => ({key: val, val})) :
    Object.keys(handlerList).map(key => ({key, val: handlerList[key]}))
}
