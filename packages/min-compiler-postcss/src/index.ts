import postcss from 'postcss'

export default async function (compilerOptions: CompilerOptions): Promise<string> {
  let { filename, content, config } = compilerOptions
  let p

  try {
    let plugins: postcss.AcceptedPlugin[] = config.plugins || []
    let css = await postcss(plugins).process(content).then(result => result.css)
    p = Promise.resolve(css)
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
