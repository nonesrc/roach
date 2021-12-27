import { RoachPluginError } from '../public/errorHandle'
import RoachRouter from '../router'
import { Plugin, PluginHandler } from '../types/pluginTypes'
import PluginParser from './parser'

const handlerRules = {
  path: (v: any) => typeof v === 'string' && /(^\/.{1,10}){1,}/.test(v),
  dispatch: (v: any) =>
    Object.prototype.toString.call(v) === '[object AsyncFunction]',
  method: (v: any) => ['get', 'post', 'put', 'delete'].includes(v),
}

export default class PluginLoder {
  private pluginParser: PluginParser
  private roachRouter: RoachRouter
  public pluginLoaded: string[]
  constructor(router: RoachRouter) {
    this.roachRouter = router
    this.pluginParser = new PluginParser()
    this.pluginLoaded = []
  }
  public install(...plugin: Plugin[]) {
    plugin.map(p => this.pluginParser.compose(p))
  }
  public process() {
    const perLoadPlugin = new Map([
      ...this.pluginParser.corePlugins,
      ...this.pluginParser.extraPlugins,
    ])
    perLoadPlugin.forEach((plugin, name) => {
      // Implements onCreate hook
      plugin.onCreate && plugin.onCreate()
      for (const handler of plugin.handlers) {
        try {
          this.pluginHandlerChenker(handler)
        } catch (error) {
          console.log(error)
          // Implements onError hook
          plugin.onError && plugin.onError(error as RoachPluginError)
          return
        }
        // Register handler
        try {
          this.roachRouter[handler.method](handler.path, handler.dispatch)
        } catch (error) {
          console.log(error)
        }
      }
      // Implements onLoaded hook
      plugin.onLoaded && plugin.onLoaded()
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
}
