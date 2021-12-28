import { Server } from 'http'
import { requestWrapper, responseWrapper } from './httpWrapper'
// RoachRouter
import RoachRouter from '../router'
import PluginLoder from '../plugin/loader'

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
