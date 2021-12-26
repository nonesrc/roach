import { Plugin, PluginComposed } from '../types/pluginTypes'
import { pluginHash } from '../utils/helper'

export default class PluginParser {
  public corePlugins: Map<string, PluginComposed>
  public extraPlugins: Map<string, PluginComposed>
  constructor() {
    this.corePlugins = new Map()
    this.extraPlugins = new Map()
  }

  public compose(plugin: Plugin) {
    plugin.type = plugin.type || 'extra'
    plugin.rootPath = plugin.rootPath || plugin.name
    const hash = pluginHash(plugin)
    const targetMap =
      plugin.type === 'core' ? this.corePlugins : this.extraPlugins
    targetMap.set(plugin.name, {
      ...plugin,
      hash,
    })
  }
  
  private pluginCheck(plugin: Plugin) {
    const str = (v: string | undefined) =>
      v ? typeof v === 'string' && Boolean(v.length) : true
  }
}
