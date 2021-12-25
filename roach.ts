import { RoachServer } from './server'

import RoachConfig from './config'
import chalker from './utils/chalker'

const roachServer = new RoachServer()
roachServer.roachRouter.get('/hello', (req, res) => {
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
