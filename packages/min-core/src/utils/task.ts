import { exec } from 'child_process'

const task = {
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
  }
}

export interface ExecResult {
  stderr: string
  stdout: string
}
export default task
