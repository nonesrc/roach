import ServerCTX from '../public/ctx'
import { RoachPluginError } from '../public/errorHandle'
import RoachRouter from '../router'
import { RoachServer } from '../server'
import { Plugin, PluginHandler, PluginInfo } from '../types/pluginTypes'
import PluginParser from './parser'

const handlerRules = {
  path: (v: any) => typeof v === 'string' && /(^\/.{1,10}){1,}/.test(v),
  dispatch: (v: any) =>
    Object.prototype.toString.call(v) === '[object AsyncFunction]',
  method: (v: any) => ['get', 'post', 'put', 'delete'].includes(v),
}

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
    plugin.forEach(p => {
      if (!this.pluginLoaded.has(p.name)) {
        this.pluginParser.compose(p)
      } else {
        console.log(`Plugin ${p.name} already installed!`)
      }
    })
  }
  public process() {
    const perLoadPlugin = new Map([
      ...this.pluginParser.corePlugins,
      ...this.pluginParser.extraPlugins,
    ])
    perLoadPlugin.forEach((plugin, name) => {
      // Implements onCreate hook
      plugin.onCreate && plugin.onCreate(this.serverCTX)
      for (const handler of plugin.handlers) {
        try {
          this.pluginHandlerChenker(handler)
          // Register handler
          this.roachRouter[handler.method](handler.path, handler.dispatch)
        } catch (error) {
          console.log(error)
          // Implements onError hook
          plugin.onError && plugin.onError(error as RoachPluginError)
          return
        }
      }
      this.pluginLoaded.set(name, {
        name: plugin.name,
        author: plugin.author,
        version: plugin.version,
      })
      // Implements onLoaded hook
      plugin.onLoaded && plugin.onLoaded(this.serverCTX)
      console.log(`${name} in install success!`)
    })
  }
  private pluginHandlerChenker(handler: PluginHandler) {
    for (const [key, rule] of Object.entries(handlerRules)) {
      let currentValue = handler[key as keyof typeof handlerRules]
      if (!rule(currentValue)) {
        throw new RoachPluginError(
          `Handler's ${key} is invalid! Current value: ${currentValue}`
        )
      }
    }
  }

  public get plugins() {
    return this.pluginLoaded
  }
}
