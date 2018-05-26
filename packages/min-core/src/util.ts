
import * as _ from 'lodash'
import * as babel from 'babel-core'
import * as ast from './utils/ast'
import * as fn from './utils/fn'
import * as git from './utils/git'
import io from './utils/io'
import log from './utils/log'
import task, { ExecResult } from './utils/task'
import text from './utils/text'

const util = {
  ..._,
  ...ast,
  ...fn,
  ...git,
  ...io,
  ...log,
  ...task,
  ...text
}

export { ExecResult }
export default util
