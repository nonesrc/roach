import ServerCTX from '../public/ctx'
import RoachError from '../public/errorHandle'
import Notifier from '../public/notifier'
import RoachRouter from '../router'
import type { Plugin, PluginHandler, PluginInfo } from '../types/pluginTypes'
import { getPluginRecord, hashStr } from '../utils/helper'
import PluginParser from './parser'

export default class PluginLoder {
  private roachRouter: RoachRouter

  private pluginParser: PluginParser

  private pluginLoaded: Map<string, PluginInfo>

  private serverCTX: ServerCTX

  constructor(router: RoachRouter) {
    this.roachRouter = router
    this.pluginParser = new PluginParser()
    this.pluginLoaded = new Map()
    this.serverCTX = new ServerCTX(this, router)
  }

  public install(...plugin: Plugin[]) {
    plugin.forEach((p) => {
      if (!this.pluginParser.corePlugins.has(p.name) && !this.pluginParser.extraPlugins.has(p.name)) {
        this.pluginParser.compose(p)
      } else {
        new Notifier('RoachWarn', `${p.name}@${p.version} already installed!`).warn()
      }
    })
  }

  public process() {
    const perLoadPlugin = new Map([...this.pluginParser.corePlugins, ...this.pluginParser.extraPlugins])
    perLoadPlugin.forEach((plugin, name) => {
      new Notifier('RoachInfo', `${name}@${plugin.version} installing...`).info()
      // Implements onCreate hook
      if (plugin.onCreate) {
        plugin.onCreate(this.serverCTX)
      }
      plugin.handlers.forEach((handler) => {
        try {
          PluginLoder.pluginHandlerChenker(handler)
          // Register handler
          this.roachRouter[handler.method](handler.path, handler.dispatch)
          // Record router
          this.roachRouter.routerCollections.set(`${handler.method}@${hashStr(handler.path)}`, getPluginRecord(plugin))
        } catch (error) {
          if (plugin.onError) {
            plugin.onError(error as RoachError)
          }
          throw error
        }
      })
      this.pluginLoaded.set(name, getPluginRecord(plugin))
      // Implements onLoaded hook
      if (plugin.onLoaded) {
        plugin.onLoaded(this.serverCTX)
      }
      new Notifier('*', `${name}@${plugin.version} is ready!`).success()
    })
  }

  static pluginHandlerChenker(handler: PluginHandler) {
    const handlerRules = {
      path: (v: any) => typeof v === 'string' && /(^\/.{1,10}){1,}/.test(v),
      dispatch: (v: any) => Object.prototype.toString.call(v) === '[object AsyncFunction]',
      method: (v: any) => ['get', 'post', 'put', 'delete'].includes(v)
    }
    Object.entries(handlerRules).forEach(([key, rule]) => {
      const currentValue = handler[key as keyof typeof handlerRules]
      if (!rule(currentValue)) {
        throw new RoachError('RoachError', `Handler's ${key} is invalid! Current value: ${currentValue}`)
      }
    })
  }

  public get plugins() {
    return this.pluginLoaded
  }
}
