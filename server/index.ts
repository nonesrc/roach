import { Server } from 'http'
import { requestWrapper, responseWrapper } from './httpWrapper'
// RoachRouter
import RoachRouter from '../router'
import PluginLoder from '../plugin/loader'
import { RoachReqMethods } from '../types/routerTypes'
import { hashStr } from '../utils/helper'

// RoachServer version
export const ROACH_VERSION = '1.0.0'

class RoachCTX {
  protected server: RoachServer
  public version: string
  constructor(server: RoachServer) {
    this.server = server
    this.version = ROACH_VERSION
  }

  public hasRouter(method: RoachReqMethods, path: string) {
    const routerHash = `${method}@${hashStr(path)}`
    return this.server.roachRouter.routers.has(routerHash)
  }
}

export class RoachServer extends Server {
  public roachRouter: RoachRouter
  public roachPluginLoder: PluginLoder
  constructor() {
    const roachRouter = RoachRouter.getInstance()
    super(async (request, response) => {
      const requestBody: Buffer[] = []
      for await (const chunk of request) {
        requestBody.push(chunk)
      }
      roachRouter.routeHandler(
        requestWrapper(request, requestBody),
        responseWrapper(response)
      )
    })
    this.roachRouter = roachRouter
    this.roachPluginLoder = new PluginLoder(roachRouter)
  }
}
