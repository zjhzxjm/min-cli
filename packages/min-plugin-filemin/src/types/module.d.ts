declare module 'pretty-data' {
  class PrettyData {
    xmlmin (code: string): string
    jsonmin (code: string): string
    cssmin (code: string): string
  }
  const pd: {
    pd: PrettyData
  }
  export = pd
}
