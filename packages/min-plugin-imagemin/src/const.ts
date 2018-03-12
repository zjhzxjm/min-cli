import Options = PluginImagemin.Options

export const DEFAULTS: Options = {
  filter: new RegExp('\.(jpg|png|jpeg)$'),
  config: {
    jpg: {},
    png: {
      quality: '65-80'
    }
  }
}
