import { patchAppMethods, patchGlobalData, patchAppLifecycle } from './init'

export default function createApp (options: App.Options) {
  const wxConfig = {}

  patchAppMethods(wxConfig, options)
  patchGlobalData(wxConfig, options.globalData)
  patchAppLifecycle(wxConfig, options)

  return App(wxConfig)
}
