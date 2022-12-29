import { Server } from 'http'
import { requestWrapper, responseWrapper } from './httpWrapper'
// RoachRouter
import RoachRouter from '../router'
import PluginLoader from '../plugin/loader'

export default class RoachServer extends Server {
  public roachRouter: RoachRouter

  public roachPluginLoader: PluginLoader

  constructor() {
    const roachRouter = RoachRouter.getInstance()
    super(async (request, response) => {
      const requestBody: Buffer[] = []
      // eslint-disable-next-line
      for await (const chunk of request) {
        requestBody.push(chunk)
      }
      roachRouter.routeHandler(requestWrapper(request, requestBody), responseWrapper(response))
    })
    this.roachRouter = roachRouter
    this.roachPluginLoader = new PluginLoader(roachRouter)
  }
}
