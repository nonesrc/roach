import RoachError from '../public/errorHandle'
import type { Plugin, PluginComposed } from '../types/pluginTypes'
import { pluginHash } from '../utils/helper'

export default class PluginParser {
  public corePlugins: Map<string, PluginComposed>

  public extraPlugins: Map<string, PluginComposed>

  constructor() {
    this.corePlugins = new Map()
    this.extraPlugins = new Map()
  }

  public compose(plugin: Plugin) {
    try {
      PluginParser.pluginInfoChecker(plugin)
    } catch (error) {
      ;(error as RoachError).notify()
      return
    }
    plugin.type = plugin.type || 'extra'
    plugin.rootPath = plugin.rootPath || plugin.name
    const hash = pluginHash(plugin)
    const targetMap = plugin.type === 'core' ? this.corePlugins : this.extraPlugins

    targetMap.set(plugin.name, {
      ...plugin,
      hash
    })
  }

  static pluginInfoChecker(plugin: Plugin) {
    const strRule = (v: any) => (v ? typeof v === 'string' && Boolean(v.length) : true)
    const pluginRules = {
      name: (v: any) => typeof v === 'string' && /^.{1,10}$/.test(v),
      // mini version: 1.0.0
      version: (v: any) => typeof v === 'string' && /^[1-9]\d?(\.(0|[1-9]\d?)){2}$/.test(v),
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
          return Object.entries(v).every(([name, version]) => {
            if (!pluginRules.name(name) || !pluginRules.version(version)) {
              return false
            }
            return true
          })
        }
        return typeof v === 'undefined'
      }
    }

    Object.entries(pluginRules).forEach(([key, rule]) => {
      const currentValue = plugin[key as keyof typeof pluginRules]
      if (!rule(currentValue)) {
        throw new RoachError('RoachError', `${plugin.name}'s ${key} is invalid!`)
      }
    })
  }
}
