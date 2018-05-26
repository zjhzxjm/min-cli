import * as _ from 'lodash'
import * as babel from 'babel-core'
import log from './log'
import t = babel.types

const CONFIG_KEY = 'config'

/**
 * Get key or value field name By t.Expression
 *
 * @param {t.Expression} keyOrValue
 * @returns {(string | undefined)}
 */
export function getKeyOrValueFieldByExpression (keyOrValue: t.Expression): string | undefined {
  // Example {config: {key, value}}
  if (t.isIdentifier(keyOrValue)) {
    return keyOrValue.name
  }

  // Example {'config': {key, value}}
  if (t.isStringLiteral(keyOrValue)) {
    return keyOrValue.value
  }

  return ''
}

/**
 * Get the config object through the node of Babel.
 *
 * @private
 * @param {t.ObjectProperty} prop
 * @returns {(Object | undefined)}
 */
export function getConfigObjectByNode (prop: t.ObjectProperty): Object | undefined {
  // if (!t.isObjectProperty(node)) {
  //   return undefined
  // }

  let { key, value } = prop
  let keyField = getKeyOrValueFieldByExpression(key)

  if (CONFIG_KEY !== keyField) {
    return undefined
  }

  if (!value) {
    return undefined
  }

  if (!t.isObjectExpression(value)) {
    log.warn('config 属性不是一个 ObjectExpression 类型')
    return undefined
  }

  let $config = {}

  // Create ast
  let configProgram = t.program([
    t.expressionStatement(
      t.assignmentExpression('=', t.identifier('$config'), value) // config = value
    )
  ])

  let { code: configCode = '' } = babel.transformFromAst(configProgram, '', {
    code: true,
    ast: false,
    babelrc: false
  })

  // Execute the code and export a $config object.
  eval(configCode)

  return _.merge($config, {
    usingComponents: {}
  })
}
