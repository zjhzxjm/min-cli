export default function (compilerOptions: CompilerOptions): Promise<any> {
  let { filename, content, config } = compilerOptions
  let p

  try {
    p = Promise.resolve()
  }
  catch (err) {
    p = Promise.reject(err)
  }

  return p
}
