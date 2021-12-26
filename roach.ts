import { RoachServer } from './server'

import RoachConfig from './config'
import chalker from './utils/chalker'
// RoachRouter Middleware
import cookieParser from './router/middleware/cookieParser'

const roachServer = new RoachServer()

roachServer.roachRouter.use(cookieParser)
roachServer.roachRouter.get('/hello/:name/:age', (req, res) => {
  console.log(req.params)
  res.json({
    text: 'hello this from router: /hello!',
  })
})

roachServer.listen(RoachConfig.serverPort, function () {
  console.clear()
  console.log(
    chalker.infoBg` Roach crawling on http://localhost:${RoachConfig.serverPort} `
  )
})
