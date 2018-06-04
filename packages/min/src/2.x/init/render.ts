import Watcher from '../observer/watcher'
import { isPlainObject, parsePath, noop } from '../util'
import $global from '../global'

export function initRender (ctx: Weapp.Context, watchDirtyFn: (dirtyData: Object, isInit: Boolean) => void) {
  let { $options } = ctx
  let cached = {}
  let isInit = true

  function getExpReg (exp: string) {
    exp = exp.replace(/(\.|\[|\])/g,'\\$1')

    return new RegExp(`^${exp}(\\.|\\[)`)
  }

  function pushCache (exp, value) {
    // @ts-ignore
    let { __ob__ } = value || {}

    if (__ob__) {
      delete __ob__.renderDirty
    }

    if (isPlainObject(value)) {
      Object.keys(value).forEach(key => pushCache(`${exp}.${key}`, value[key]))
    }
    else if (Array.isArray(value)) {
      value.forEach((item, index) => pushCache(`${exp}[${index}]`, item))
    }
    else {
      cached[exp] = value
    }
  }

  function removeCache (exp) {
    // a.b => /^a\.b(\.|\[)/
    // a[b] => /^a\[b\](\.|\[)/
    let regexp = getExpReg(exp)

    // a.b.c 、a.b[0]
    Object.keys(cached).forEach(key => {
      if (key === exp || regexp.test(key)) {
        delete cached[key]
      }
    })
  }

  function getDirtyData (exp, value) {
    let dirtyData = {}
    if (isPlainObject(value) || Array.isArray(value)) {
      // @ts-ignore
      let { __ob__ } = value

      if (__ob__.renderDirty) { // 数据结构已改变
        dirtyData[exp] = value

        // exp => a.b
        // remove [a.b.c, a.b[0]] from cached
        removeCache(exp)

        // exp => a.b
        // value => { c: { d: 1 } }
        // cached => a.b.c.d = 1
        pushCache(exp, value)
      }
      else {
        let dirtyDatas = []
        if (isPlainObject(value)) {
          dirtyDatas = Object.keys(value).map(key => {
            return getDirtyData(`${exp}.${key}`, value[key])
          })
        }
        else {
          dirtyDatas = value.map((item, index) => {
            return getDirtyData(`${exp}[${index}]`, item)
          })
        }

        dirtyDatas.forEach(data => Object.assign(dirtyData, data))
      }
    }
    else if (value !== cached[exp]) { // 简单数据类型
      dirtyData[exp] = value
      pushCache(exp, value)
    }
    return dirtyData
  }

  let renderWatcher = new Watcher(ctx, () => {
    let dirtyData = {}
    let { _renderExps: renderExps = [] } = $options

    if (isInit) {
      renderExps
      .forEach(exp => {
        let getter = parsePath(exp, true) || noop
        let value = getter.call(ctx, ctx, dirtyData)
        pushCache(exp, value)
      })

      {
        // filter not computed
        const computeds = Object.keys(ctx._computedWatchers || {})
        if (computeds.length === 0) {
          dirtyData = {}
        }
        else {
          Object.keys(dirtyData).forEach(key => {
            const has = computeds.some(exp => {
              return key === exp || getExpReg(exp).test(key)
            })
            if (!has) {
              delete dirtyData[key]
            }
          })
        }
      }
    }
    else {
      console.time('time')
      renderExps
      .map(exp => {
        let getter = parsePath(exp, true) || noop
        let value = getter.call(ctx, ctx)
        return getDirtyData(exp, value)
      })
      .forEach(res => Object.assign(dirtyData, res))
      console.timeEnd('time')
    }

    if (Object.keys(dirtyData).length > 0) {
      console.group('DirtyData')
      console.log(JSON.parse(JSON.stringify(dirtyData)))
      console.groupEnd()
    }

    // console.group('dirtyCached')
    // console.log(JSON.parse(JSON.stringify(cached)))
    // console.groupEnd()

    try {
      watchDirtyFn(dirtyData, isInit)
    }
    catch (err) {
      console.error(err)
    }

    isInit = false
  }, noop, null, true)

  return renderWatcher
}
