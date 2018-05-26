import * as _ from 'lodash'

const colors = require('colors')

colors.setTheme({
  '变更': 'bgYellow',
  '删除': 'bgMagenta',
  '执行': 'blue',
  '压缩': 'blue',
  '信息': 'grey',
  '完成': 'green',
  '创建': 'green',
  '监听': 'magenta',
  '错误': 'red',
  '测试': 'red',
  '拷贝': 'yellow',
  '编译': 'blue',
  '写入': 'green',
  'INFO': 'grey',
  'DEBUG': 'bgRed',
  'TIME': 'bgMagenta'
})

const log = {
  datetime (date = new Date(), format = 'HH:mm:ss') {
    let fn = (d: number) => {
      return ('0' + d).slice(-2)
    }
    if (date && _.isString(date)) {
      date = new Date(Date.parse(date))
    }
    type Formats = {
      [key: string]: string | number
    }
    const formats: Formats = {
      YYYY: date.getFullYear(),
      MM: fn(date.getMonth() + 1),
      DD: fn(date.getDate()),
      HH: fn(date.getHours()),
      mm: fn(date.getMinutes()),
      ss: fn(date.getSeconds())
    }
    return format.replace(/([a-z])\1+/ig, (str) => {
      return formats[str].toString() || str
    })
  },

  timeStart (label: string) {
    console.time(label)
  },

  timeEnd (label: string) {
    this.log('', 'TIME')
    console.timeEnd(label)
  },

  debug (name: string, msg: string | Object, showTime = true) {
    console.log()
    this.log(`----------${name}----------`)
    this.log(msg, 'debug', showTime)
    this.log(`----------${name}----------`)
    console.log()
  },

  error (msg: string | Error, showTime = true) {
    // this.writeLog(msg, 'error')
    this.log(msg, 'error', showTime)
    // if (!isWatch) {
    //   process.exit(0)
    // }
  },

  warn (msg: string | Object, showTime = true) {
    // this.writeLog(msg, 'warn')
    this.log(msg, 'warning', showTime)
  },

  log (msg: string | Object | Error, type: string = 'INFO', showTime = true) {
    let dateTime = showTime ? colors.gray(`[${this.datetime()}] `) : ''
    if (!(msg instanceof Error) && _.isObject(msg)) {
      msg = JSON.stringify(msg)
    }

    if (type && _.isString(type)) {
      type = type.toUpperCase()
      if (type === 'ERROR') {
        if (msg instanceof Error) {
          console.error(colors.red('[ERROR] ' + (msg.stack || msg.message)))
        }
        else {
          console.error(dateTime + colors.red('[ERROR] ' + msg))
        }
      }
      else if (type === 'WARNING') {
        console.error(dateTime + colors.yellow('[WARNING] ' + msg))
      }
      else {
        let fn = colors[type] ? colors[type] : colors['信息']
        console.log(dateTime + fn(`[${type}]`) + ' ' + msg)
      }
    }
    else {
      console.log(dateTime + msg)
    }
  }
}

export default log
