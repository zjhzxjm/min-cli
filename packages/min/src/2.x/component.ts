import { patchProps, patchComponentMethods, patchData, patchComponentLifecycle } from './init'

export default function createComponent (options: Component.Options, exts?: Weapp.Extends) {
  const wxConfig = {}

  patchProps(wxConfig, options.properties)
  patchComponentMethods(wxConfig, options)
  patchData(wxConfig, options.data)
  patchComponentLifecycle(wxConfig, options, exts)

  return Component(wxConfig)
}
