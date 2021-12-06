import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
// Pluginloader
import roachPluginLoader from './loader'
// Plugin
import ccAuth from '../plugins/core/ccAuth'
// chalk
import chalk from 'chalk'

const app = new Koa()
app.use(bodyParser())
const pluginLoader = roachPluginLoader.getInstance(app)
pluginLoader.installer(ccAuth)

app.listen(8800, () => {
  console.log(
    `${chalk.hex('#000000').bgGreen(' Roach ')} crawling on http://localhost:8800`
  )
})
