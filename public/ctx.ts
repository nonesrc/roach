import type PluginLoader from '../plugin/loader'
import type RoachRouter from '../router'
import type { RoachReqMethods } from '../types/routerTypes'
import { hashStr } from '../utils/helper'

// RoachServer version
const ROACH_VERSION = '1.0.0'

export default class ServerCTX {
  private loader: PluginLoader

  private router: RoachRouter

  public version: string

  constructor(loader: PluginLoader, router: RoachRouter) {
    this.loader = loader
    this.router = router
    this.version = ROACH_VERSION
  }

  public hasRouter(method: RoachReqMethods, path: string) {
    const routerHash = `${method}@${hashStr(path)}`
    return this.router.routers.has(routerHash)
  }

  public get routers() {
    return this.router.routers
  }

  public get plugins() {
    return this.loader.plugins
  }
}
