import { RoachPluginError } from '../public/errorHandle'
import { Plugin, PluginComposed } from '../types/pluginTypes'
import { pluginHash } from '../utils/helper'

const strRule = (v: any) =>
  v ? typeof v === 'string' && Boolean(v.length) : true
const pluginRules = {
  name: (v: any) => typeof v === 'string' && /^.{1,10}$/.test(v),
  // mini version: 1.0.0
  version: (v: any) =>
    typeof v === 'string' && /^[1-9]\d?(\.(0|[1-9]\d?)){2}$/.test(v),
  type: (v: any) => (v ? ['core', 'extra'].includes(v) : true),
  author: strRule,
  rootPath: strRule,
  describe: strRule,
  usage: strRule,
  onCreate: (v: any) => (v ? typeof v === 'function' : true),
  onError: (v: any) => (v ? typeof v === 'function' : true),
  onLoaded: (v: any) => (v ? typeof v === 'function' : true),
  dependencies: (v: any) => {
    if (typeof v === 'object') {
      for (const [name, version] of Object.entries(v)) {
        if (!pluginRules.name(name) || !pluginRules.version(version))
          return false
      }
      return true
    } else {
      return typeof v === 'undefined'
    }
  },
}

export default class PluginParser {
  public corePlugins: Map<string, PluginComposed>
  public extraPlugins: Map<string, PluginComposed>

  constructor() {
    this.corePlugins = new Map()
    this.extraPlugins = new Map()
  }

  public compose(plugin: Plugin) {
    try {
      this.pluginInfoChecker(plugin)
    } catch (error) {
      console.log(error)
      return
    }
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

  private pluginInfoChecker(plugin: Plugin) {
    Object.entries(pluginRules).forEach(([key, rule]) => {
      let currentValue = plugin[key as keyof typeof pluginRules]
      if (!rule(currentValue)) {
        throw new RoachPluginError(
          `${plugin.name}'s ${key} is invalid! Current value:${currentValue}`
        )
      }
    })
  }
}
