// export function logger (msg: string) {
//   throw new Error(`[Minx warn] ${msg}`)
// }
// import * as chalk from 'chalk'

// interface TYPES {
//   name: string
//   color: string
// }

// const TYPES = {
//   ERROR: {
//     name: 'error',
//     color: 'red'
//   },
//   WARN: {
//     name: 'warn',
//     color: 'yellow'
//   }
// }

// const output = (type: TYPES, msg: string | Error) => {
//   if (type.name === 'info') {
//     console.log(msg)
//     return
//   }
//   const color = type.color
//   console.log(chalk[type.color](msg))
// }

const log = {
  error (msg: string | Error) {
    console.error(msg)
  },
  warn (msg: string | Error) {
    console.warn(msg)
  }
}

export default log
