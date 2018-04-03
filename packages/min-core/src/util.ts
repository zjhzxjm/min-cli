import * as path from 'path'
import * as fs from 'fs-extra'
import { exec } from 'child_process'
import * as _ from 'lodash'

export interface ExecResult {
  stderr: string
  stdout: string
}

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

const util = {
  ..._,
  /**
   * get indent of a mutiple lines string
   * return {length: 4, char: ' '}
   */
  getIndent (str: string) {
    let arr = str.split('\n')
    while (arr.length && !/\w/.test(arr[0])) { // if the first line is empty line, then get rid of it
      arr.shift()
    }
    let indent = { firstLineIndent: 0, indent: 0, char: '' }
    let s = arr[0]
    let i = 0
    if (s.charCodeAt(0) === 32 || s.charCodeAt(0) === 9) { // 32 is space, 9 is tab
      indent.char = s[0]
    }
    while (s[i] === indent.char) {
      i++
    }
    indent.firstLineIndent = i
    if (!arr[1]) {
      return indent
    }

    s = arr[1], i = 0
    if (!indent.char) {
      if (s.charCodeAt(0) === 32 || s.charCodeAt(0) === 9) { // 32 is space, 9 is tab
        indent.char = s[0]
      }
    }
    while (s[i] === indent.char) {
      i++
    }
    indent.indent = i - indent.firstLineIndent
    return indent
  },

  /**
   * Fix indent for a mutiple lines string
   * @param  {String} str  string to fix
   * @param  {Number} num  4 means add 4 chars to each line, -4 means remove 4 chars for each line
   * @param  {String} char space or tab, indent charactor
   * @return {String}      fixed indent string
   */
  fixIndent (str: string, num: number, char: string) {
    if (char === undefined) {
      let indent = this.getIndent(str)
      char = indent.char
    }
    let arr = str.split('\n')
    if (num > 0) { // added char to each line
      arr.forEach(function (v, i) {
        let p = 0
        while (p++ < num) {
          arr[i] = char + arr[i]
        }
      })
    }
    else { // remove char for each line
      arr.forEach(function (v, i) {
        arr[i] = arr[i].substr(-1 * num)
      })
    }
    return arr.join('\n')
  },

  exec (cmd: string, quite: boolean = false): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
      let fcmd = exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err)
        }
        else {
          resolve({ stdout, stderr })
        }
      })

      fcmd.stdout.on('data', (chunk) => {
        !quite && process.stdout.write(chunk)
      })
      fcmd.stderr.on('data', (chunk) => {
        !quite && process.stdout.write(chunk)
      })
    })
  },

  timeoutExec (seconds: number, cmd: string, quite: boolean) {
    let timeout = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('timeout')
      }, seconds * 1000)
    })
    let task = this.exec(cmd, quite)
    return Promise.race([timeout, task])
  },

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
    if (!(msg instanceof Error) && this.isObject(msg)) {
      msg = JSON.stringify(msg)
    }

    if (type && this.isString(type)) {
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
  },

  async isDir (filepath: string): Promise<boolean> {
    let exsits = await fs.pathExists(filepath)

    if (!exsits) return false

    let stats = await fs.stat(filepath)
    return stats.isDirectory()
  },

  async writeFile (filepath: string, data: string) {
    let parsed = path.parse(filepath)

    if (!await this.isDir(parsed.dir)) {
      await fs.ensureDir(parsed.dir)
    }

    await fs.writeFile(filepath, data)
  }
}

export default util
