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
roachServer.roachPluginLoder.install(ccAuth)
roachServer.roachPluginLoder.install(easyAuth)
roachServer.roachPluginLoder.install(eduAuth)
roachServer.roachPluginLoder.install(ssoAuth)
roachServer.roachPluginLoder.install(eduSystem)
roachServer.roachPluginLoder.install(healthMark)

roachServer.listen(RoachConfig.serverPort, () => {
  // eslint-disable-next-line
  console.clear()
  roachServer.roachPluginLoder.process()
  // eslint-disable-next-line
  console.log(chalker.success.bold`Roach crawling on http://localhost:${RoachConfig.serverPort}`)
})
