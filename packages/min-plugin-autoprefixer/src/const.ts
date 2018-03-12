import Options = PluginAutoprefixer.Options

export const DEFAULTS: Options = {
  filter: new RegExp('\.(wxss)$'),
  config: {
    browsers: ['Android >= 2.3', 'Chrome > 20', 'iOS >= 6']
  }
}
