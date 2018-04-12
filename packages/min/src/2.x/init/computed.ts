
import Watcher from '../observer/watcher'
import Dep from '../observer/dep'
import { warn, noop } from '../util'
import { sharedPropertyDefinition } from './data'

export function initComputed (ctx: Weapp.Context, weappConfig: Weapp.Config) {
  const { $options } = ctx
  const { computed = {} } = $options
  const watchers = ctx._computedWatchers = Object.create(null)
  const computedWatcherOptions = { lazy: true }
  const keys = Object.keys(computed)

  keys.forEach(key => {
    const userDef = computed[key]
    // @ts-ignore
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        ctx
      )
    }

    // create internal watcher for the computed property.
    watchers[key] = new Watcher(
      ctx,
      getter || noop,
      noop,
      computedWatcherOptions
    )

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in ctx)) {
      defineComputed(ctx, key, userDef)
      weappConfig.data[key] = ctx[key]
    }
    else if (process.env.NODE_ENV !== 'production') {
      if (key in ctx.$data) {
        warn(`The computed property "${key}" is already defined in data.`, ctx)
      }
      else if (ctx.$options.properties && key in ctx.$options.properties) {
        warn(`The computed property "${key}" is already defined as a prop.`, ctx)
      }
    }
  })
}

export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function | any
) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = noop
  }
  else {
    sharedPropertyDefinition.get = userDef.get
      ? userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }

  if (process.env.NODE_ENV !== 'production' && sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
