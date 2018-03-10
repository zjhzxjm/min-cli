import less from 'less'
import path from 'path'

export default function (content: string, options: Less.Options, file: string) {
  return new Promise ((resolve, reject) => {
    let opath = path.parse(file)
    options.paths = [opath.dir]

    less.render(content, options).then(res => {
      resolve(res.css)
    }).catch(reject)
  })
}
