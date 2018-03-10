import global from './global'
import * as Promise from 'promise-polyfill'
import * as regeneratorRuntime from 'regenerator-runtime/runtime'

// IOS 10.0.1 may cause IOS crash.
global.Promise = Promise
global.regeneratorRuntime = regeneratorRuntime
