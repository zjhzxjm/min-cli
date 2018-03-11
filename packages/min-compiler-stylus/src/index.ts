import path from 'path'
import stylus from 'stylus'

export default function (compilerOptions: CompilerOptions): Promise<any> {
  let { filename, content, config } = compilerOptions
  let opath = path.parse(filename)

  let options = Object.assign({}, config, {
    paths: [opath.dir],
    filename: opath.base
  })

  return new Promise ((resolve, reject) => {
    stylus.render(content, options, function (err, css) {
      if (err) {
        reject(err)
      }
      else {
        resolve(css)
      }
    })
  })
}
