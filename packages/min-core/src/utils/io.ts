import * as path from 'path'
import * as fs from 'fs-extra'

const io = {
  async isDir (filepath: string): Promise<boolean> {
    let exsits = await fs.pathExists(filepath)

    if (!exsits) return false

    let stats = await fs.stat(filepath)
    return stats.isDirectory()
  },

  async writeFile (filepath: string, data: string) {
    let parsed = path.parse(filepath)

    if (!await this.isDir(parsed.dir)) {
      await fs.ensureDir(parsed.dir)
    }

    await fs.writeFile(filepath, data)
  }
}

export default io
