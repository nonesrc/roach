import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
// Pluginloader
import roachPluginLoader from './loader'
// Plugin
import ccAuth from '../plugins/core/ccAuth'

const app = new Koa()
app.use(bodyParser())
const pluginLoader = roachPluginLoader(app)
pluginLoader.installer(ccAuth)

app.listen(8800, () => {
  console.log('Roach crawling on http://localhost:8800')
})
