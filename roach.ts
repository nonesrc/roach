import RoachServer from './server'

import RoachConfig from './config'
import chalker from './utils/chalker'
// RoachRouter Middleware
import cookieParser from './router/middleware/cookieParser'
// Plugins
import ccAuth from './plugin/core/ccAuth'
import easyAuth from './plugin/core/easyAuth'
import eduAuth from './plugin/core/eduAuth'
import ssoAuth from './plugin/core/ssoAuth'
import eduSystem from './plugin/extra/eduSystem'
import healthMark from './plugin/extra/healthMark'

const roachServer = new RoachServer()
// Install roachRouter middlewares
roachServer.roachRouter.use(cookieParser)
// Install plugins
roachServer.roachPluginLoader.install(ccAuth)
roachServer.roachPluginLoader.install(easyAuth)
roachServer.roachPluginLoader.install(eduAuth)
roachServer.roachPluginLoader.install(ssoAuth)
roachServer.roachPluginLoader.install(eduSystem)
roachServer.roachPluginLoader.install(healthMark)

roachServer.listen(RoachConfig.serverPort, () => {
  // eslint-disable-next-line
  console.clear()
  roachServer.roachPluginLoader.process()
  // eslint-disable-next-line
  console.log(chalker.success.bold`Roach crawling on http://localhost:${RoachConfig.serverPort}`)
})
