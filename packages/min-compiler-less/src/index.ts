import less from 'less'
import path from 'path'

export default async function (compilerOptions: CompilerOptions): Promise<Less.RenderOutput> {
  let { filename, content, config } = compilerOptions
  let opath = path.parse(filename)

  let options: Less.Options = Object.assign({}, config, {
    filename,
    paths: [opath.dir]
  })

  return await less.render(content, options)
}
