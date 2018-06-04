import { defineReactive, toggleObserving, observe } from '../observer'
import { warn, hyphenate, isReservedAttribute, isPlainObject, noop } from '../util'
import { proxy } from './data'
import MinComponent from '../class/MinComponent'

export function initProps (ctx: Component.Context) {
  const { $options, $wx } = ctx
  const { properties = {} } = $options
  const keys = Object.keys(properties)
  const _properties = ctx._properties = {}

  keys.forEach(key => {

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

    _properties[key] = properties[key].value
    // defineReactive(_properties, key, value)

    // instantiation here.
    if (!(key in ctx)) {
      proxy(ctx, `_properties`, key)
    }
  })

  // observe properties
  observe(_properties, true /* asRootData */)
}

export function patchProps (wxConfig: Weapp.Config, properties: Weapp.Properties) {
  if (!properties) {
    properties = {}
  }

  const props = {}
  const keys = Object.keys(properties)

  keys.forEach(key => {
    const property = properties[key]
    let type = null
    let value = undefined
    let observer = noop

    if (isPlainObject(property)) {
      value = property.value
      observer = property.observer || noop
      type = property.type || null
    }
    else if (typeof property === 'function') {
      observer = property
    }
    else {
      value = property
    }

    // Proxy observer
    props[key] = {
      type,
      value,
      observer (newVal, oldVal) {
        const ctx = this.$min as MinComponent
        const { _properties = {} } = ctx

        // TODO: optimization
        _properties[key] = newVal

        if (typeof observer === 'string' && typeof this[observer] === 'function') {
          observer = this[observer]
        }

        if (typeof observer === 'function') {
          observer.apply(ctx, arguments)
        }
      }
    }
  })

  wxConfig.properties = props
}
