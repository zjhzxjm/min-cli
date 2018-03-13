import Options = UglifyjsPlugin.Options

export const DEFAULTS: Options = {
  filter: new RegExp('\.(js)$'),
  config: {
    compress: {
      warnings: false
    },
    fromString: true
  }
}
