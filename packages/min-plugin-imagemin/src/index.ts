import * as path from 'path'
import * as imagemin from 'imagemin'
import * as imageminMozjpeg from 'imagemin-mozjpeg'
import * as imageminPngquant from 'imagemin-pngquant'
// import * as imageminWebp from 'imagemin-webp'
// import * as imageminGifsicle from 'imagemin-gifsicle'
import { util, PluginHelper } from '@mindev/min-core'

const DEFAULTS: ImageminPlugin.Options = {
  config: {
    jpg: {},
    png: {
      quality: '65-80'
    },
    webp: {
      quality: 50
    },
    gif: {}
  },
  filter: new RegExp('\.(jpg|png|jpeg)$'),
  validate (options: PluginHelper.Options) {
    return true
  }
}

export namespace ImageminPlugin {
  export interface Config {
    jpg: any,
    png: any,
    webp: any,
    gif: any
  }

  export interface Options {
    config: Config
    filter: RegExp
    validate (options: PluginHelper.Options): boolean
  }
}

export default class ImageminPlugin extends PluginHelper.ImagePlugin {

  constructor (public options: ImageminPlugin.Options) {
    super('ImageminPlugin')

    this.options = {
      ...DEFAULTS,
      ...this.options
    }
  }

  async apply (options: PluginHelper.Options): Promise<PluginHelper.Options> {
    let { filter, validate, config } = this.options
    let { cwd, filename, extend } = options
    let p = Promise.resolve(options)

    if (util.isRegExp(filter) && !filter.test(filename)) {
      return p
    }

    if (util.isFunction(validate) && !validate(options)) {
      return p
    }

    // output('压缩', filename)

    try {
      let filepath = path.join(cwd, filename)

      let files = await imagemin([filepath], '', {
        plugins: [
          imageminMozjpeg(config.jpg),
          imageminPngquant(config.png)
          // imageminWebp(config.webp),
          // imageminGifsicle(config.gif)
        ]
      })

      if (files && files.length) {
        util.merge(options, { extend: { buffer: files[0].data } })
      }
    }
    catch (err) {
      p = Promise.reject(err)
    }

    return p
  }
}
