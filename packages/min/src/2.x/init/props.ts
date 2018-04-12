import { defineReactive, toggleObserving } from '../observer'
import { warn, hyphenate, isReservedAttribute, isPlainObject, noop } from '../util'
import { proxy } from './data'

export function initProps (ctx: Component.Context, wxConfig: Component.Config) {
  const { $options } = ctx
  const { properties = {} } = $options
  const keys = Object.keys(properties)
  const _properties = ctx._properties = {}

  keys.forEach(key => {
    const property = properties[key]
    let value = undefined
    let observer

    if (isPlainObject(property)) {
      value = property.value
      observer = property.observer
    }
    else if (typeof property !== 'function') {
      value = property
      observer = noop
    }

    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) /* || config.isReservedAttr(hyphenatedKey) */) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          ctx
        )
      }

      // if (typeof observer !== 'function') {
      //   warn(
      //     `The properties "${key}" observer property type is not a function. `,
      //     ctx
      //   )
      // }
    }

    // Proxy observer
    properties[key].observer = function (newVal, oldVal) {
      _properties[key] = newVal

      if (typeof observer === 'string' && wxConfig.methods) {
        observer = wxConfig.methods[observer]
      }

      if (typeof observer === 'function') {
        observer.apply(ctx, arguments)
      }
    }

    defineReactive(_properties, key, value)

    // instantiation here.
    if (!(key in ctx)) {
      proxy(ctx, `_properties`, key)
    }
  })

  wxConfig.properties = properties
}
