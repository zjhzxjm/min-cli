import sass from 'node-sass'

export default function (compilerOptions: CompilerOptions): Promise<sass.Result> {
  let { filename, content, config } = compilerOptions
  let options: sass.Options = Object.assign({}, config, {
    data: content,
    file: filename
  })

  return new Promise((resolve, reject) => {
    sass.render(options, (err: sass.SassError, result: sass.Result) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(result)
      }
    })
  })
}
