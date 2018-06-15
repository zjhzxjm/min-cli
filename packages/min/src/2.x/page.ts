import { patchPageMethods, patchData, patchPageLifecycle } from './init'

export default function createPage (options: Page.Options, exts?: Weapp.Extends) {
  const wxConfig = {}

  patchPageMethods(wxConfig, options)
  patchData(wxConfig, options.data)
  patchPageLifecycle(wxConfig, options, exts)

  return Page(wxConfig)
}
