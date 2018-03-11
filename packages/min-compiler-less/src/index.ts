import less from 'less'
import path from 'path'

export default async function (compilerOptions: CompilerOptions): Promise<string> {
  let { filename, content, config } = compilerOptions
  let opath = path.parse(filename)

  let options: Less.Options = Object.assign({}, config, {
    filename,
    paths: [opath.dir]
  })
  let p

  try {
    let css = await less.render(content, options).then(result => result.css)
    p = Promise.resolve(css)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
