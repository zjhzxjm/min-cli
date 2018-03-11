import less from 'less'
import path from 'path'

export default async function (compilerOptions: CompilerOptions): Promise<string> {
  let { filename, content, config } = compilerOptions
  let opath = path.parse(filename)

  let options: Less.Options = Object.assign({}, config, {
    filename,
    paths: [opath.dir]
  })

  try {
    let css = await less.render(content, options).then(result => result.css)
    return Promise.resolve(css)
  }
  catch (err) {
    return Promise.reject(err)
  }
}
