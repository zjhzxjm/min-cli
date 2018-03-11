import pug from 'pug'

export default function (compilerOptions: CompilerOptions): Promise<any> {
  let { filename, content, config } = compilerOptions
  let { data } = config
  let p

  delete config.data

  try {
    let templete = pug.compile(content, config)
    let html = templete(data)
    p = Promise.resolve(html)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
