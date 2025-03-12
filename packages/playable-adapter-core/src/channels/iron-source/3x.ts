import { AD_SDK_SCRIPT } from './inject-vars'
import { exportSingleFile } from "@/exporter/3x"
import { getChannelRCSdkScript } from '@/utils'
import { TChannel, TChannelPkgOptions } from "@/typings"

export const export3xIronSource = async (options: TChannelPkgOptions) => {
  const channel: TChannel = 'Ironsource'
  await exportSingleFile({
    ...options,
    channel,
    transformHTML: async ($) => {
      const sdkInjectScript = getChannelRCSdkScript(channel) || AD_SDK_SCRIPT
      $(sdkInjectScript).appendTo('head')

      // $(ONLOAD_SCRIPT).appendTo('head')
    }
  })
}