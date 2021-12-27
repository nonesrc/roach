import { RoachServer } from './server'

import RoachConfig from './config'
import chalker from './utils/chalker'
// RoachRouter Middleware
import cookieParser from './router/middleware/cookieParser'
// Plugins
import ccAuth from './plugin/core/ccAuth'

const roachServer = new RoachServer()
// Install roachRouter middlewares
roachServer.roachRouter.use(cookieParser)
// Registe Routers
// roachServer.roachRouter.get('/hello/:name/:age', (req, res) => {
//   console.log(req.params)
//   res.json({
//     text: 'hello this from router: /hello!',
//   })
// })
roachServer.roachPluginLoder.install(ccAuth)

roachServer.listen(RoachConfig.serverPort, function () {
  // console.clear()
  roachServer.roachPluginLoder.process()
  console.log(
    chalker.infoBg` Roach crawling on http://localhost:${RoachConfig.serverPort} `
  )
})
