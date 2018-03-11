import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import { DEFAULTS } from './const'

import Plugin = PluginHelper.Plugin
import PluginOptions = PluginHelper.Options
import Options = PluginImagemin.Options

export default class PluginImagemin implements Plugin {
  constructor (public options: Options) {
    this.options = Object.assign({}, DEFAULTS, this.options)
  }

  async apply (pluginOptions: PluginOptions): Promise<Buffer | null> {
    let { filter, config } = this.options
    let { filename, output } = pluginOptions

    if (!filter.test(filename)) {
      return Promise.resolve(null)
    }
    else {
      output('压缩', filename)

      let files = await imagemin([filename], null, {
        plugins: [
          imageminMozjpeg(config.jpg),
          imageminPngquant(config.png)
        ]
      })

      return Promise.resolve(files[0].data)
    }
  }
}
