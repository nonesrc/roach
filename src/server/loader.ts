import {
  pluginInfoType,
  pluginRouterType,
  pluginAbstractType,
} from '../types/plugin'
import { createHash } from 'crypto'
import Koa from 'koa'
import _ from 'koa-route'
import * as chalkers from '../utils/chalkers'

const LOG = console.log

export default class roachPluginLoader {
  private static instance: roachPluginLoader
  private app: Koa
  private plugins: pluginInfoType[]
  private pluginloadedInfo: Record<string, Required<pluginAbstractType>>[]
  constructor(app: Koa, plugins: pluginInfoType[] = []) {
    this.app = app
    this.plugins = plugins
    this.pluginloadedInfo = []
    console.clear()
    for (const plugin of plugins) this.installer(plugin)
  }
  // Generate plugin hash and decorate it
  public pluginInfoBuilder(plugin: pluginInfoType): Required<pluginInfoType> {
    const {
      name,
      describe = '',
      usage = '',
      author = '',
      version = '',
      routers,
    } = plugin
    const routerBuilder = function (
      routers: pluginRouterType[]
    ): Required<pluginRouterType>[] {
      return routers.map(r => ({
        path: r.path,
        dispatch: r.dispatch,
        method: r.method || 'get',
        type: r.type || 'application/json',
        callback: r.callback || function () {},
      }))
    }
    const hashConstructStr = [
      name,
      describe,
      usage,
      author,
      version,
      new Date().getMilliseconds(),
    ].join('')
    const hash = createHash('md5').update(hashConstructStr).digest('hex')
    return {
      name,
      describe,
      usage,
      author,
      version,
      hash,
      routers: routerBuilder(routers),
    }
  }

  public installNotify(pluginInfo: Required<pluginInfoType>, status?: any) {
    const bannerStyle = !status ? chalkers.successBg : chalkers.errorBg
    const pickers: (keyof pluginAbstractType)[] = [
      'author',
      'describe',
      'usage',
    ]
    LOG(
      bannerStyle(
        chalkers.bold(
          `\n ${pluginInfo.name}@${pluginInfo.version || 'unknown'} `
        )
      ) +
        chalkers.bold(` install ${!status ? 'success' : 'error'}!`) +
        pickers
          .map(
            p =>
              `\n» ${chalkers.error.bold(p.padEnd(10, ' '))} ${
                pluginInfo[p] || 'unkown'
              }`
          )
          .join('') +
        '\n'
    )
  }
  // Plugin installer
  public installer(plugin: pluginInfoType) {
    const pluginFormated = this.pluginInfoBuilder(plugin)
    const isInstalled = this.pluginloadedInfo
      .map(p => Object.keys(p)[0])
      .includes(pluginFormated.hash)
    if (isInstalled) {
      return chalkers.warningBg(
        `${pluginFormated.name}@${
          pluginFormated.version || 'unknown'
        } already installed`
      )
    }
    for (const router of pluginFormated.routers) {
      try {
        this.app.use(
          _[router.method!](router.path, async ctx => {
            await router.dispatch(ctx)
            router.callback!()
            ctx.response.type = router.type!
          })
        )
        // Plugin record
        this.pluginloadedInfo.push({
          [pluginFormated.hash]: {
            name: pluginFormated.name,
            describe: pluginFormated.describe,
            usage: pluginFormated.usage,
            author: pluginFormated.author,
            version: pluginFormated.version,
          },
        })
        // Notify
        this.installNotify(pluginFormated)
      } catch (error) {
        this.installNotify(
          pluginFormated,
          String.prototype.toString.call(error)
        )
      }
    }
  }
  static getInstance(app: Koa, plugins: pluginInfoType[] = []) {
    if (!this.instance) {
      this.instance = new roachPluginLoader(app, plugins)
    }
    return this.instance
  }
}
