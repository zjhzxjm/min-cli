export default function (compilerOptions: CompilerOptions): Promise<any> {
  let { filename, content, config } = compilerOptions

  try {
    return Promise.resolve()
  }
  catch (err) {
    return Promise.reject(err)
  }
}
