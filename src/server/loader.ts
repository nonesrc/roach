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
function resolvePluginTag(
  pluginInfo: Required<pluginInfoType>,
  decorator: (s: string) => string
): string {
  return decorator(chalkers.bold(` ${pluginInfo.name}@${pluginInfo.version} `))
}

export default class roachPluginLoader {
  private static instance: roachPluginLoader
  private app: Koa
  private allRouters: string[]
  public pluginloadedInfo: Record<string, Required<pluginAbstractType>>[]
  constructor(app: Koa, plugins: pluginInfoType[] = []) {
    this.app = app
    this.allRouters = []
    this.pluginloadedInfo = []
    console.clear()
    for (const plugin of plugins) this.installer(plugin)
  }

  // Generate plugin hash and decorate it
  public pluginInfoBuilder(plugin: pluginInfoType): Required<pluginInfoType> {
    const {
      name,
      describe = 'unknown',
      usage = 'unknown',
      author = 'unknown',
      version = 'unknown',
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

  public loadedNotify(
    pluginInfo: Required<pluginInfoType>,
    pluginDiffLen: number
  ) {
    const bannerStyle = pluginDiffLen ? chalkers.warningBg : chalkers.successBg
    const pickers: (keyof pluginAbstractType)[] = [
      'author',
      'describe',
      'usage',
    ]
    LOG(
      resolvePluginTag(pluginInfo, bannerStyle) +
        chalkers.bold(
          ` install success! ${
            pluginDiffLen
              ? pluginDiffLen + ' router(s) loading failed!'
              : 'all routers loading succeeded!'
          }`
        ) +
        pickers
          .map(
            p =>
              `\n» ${chalkers.error.bold(p.padEnd(10, ' '))} ${pluginInfo[p]}`
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
    const routerLoaded: string[] = []
    if (isInstalled) {
      return chalkers.bold(
        `\n${resolvePluginTag(
          pluginFormated,
          chalkers.errorBg
        )} already installed!`
      )
    }
    for (const router of pluginFormated.routers) {
      // Check if the same route exists
      if (this.allRouters.includes(router.path)) {
        LOG(
          chalkers.bold(
            resolvePluginTag(pluginFormated, chalkers.warningBg) +
              ` Path ${chalkers.error(router.path)} already exists!`
          )
        )
        continue
      }
      try {
        this.app.use(
          _[router.method!](router.path, async ctx => {
            await router.dispatch(ctx)
            router.callback!()
            ctx.response.type = router.type!
          })
        )
        // Plugin router record
        routerLoaded.push(router.path)
      } catch (error) {
        // If errors are caught, cancel the installation
        return LOG(
          chalkers.bold(
            `\n${resolvePluginTag(
              pluginFormated,
              chalkers.errorBg
            )} loading failed!`
          )
        )
      }
    }
    // Success loaded notify
    this.loadedNotify(
      pluginFormated,
      pluginFormated.routers.length - routerLoaded.length
    )
    this.allRouters.push(...routerLoaded)
    this.pluginloadedInfo.push({
      [pluginFormated.hash]: {
        name: pluginFormated.name,
        describe: pluginFormated.describe,
        usage: pluginFormated.usage,
        author: pluginFormated.author,
        version: pluginFormated.version,
      },
    })
  }

  static getInstance(app: Koa, plugins: pluginInfoType[] = []) {
    if (!this.instance) {
      this.instance = new roachPluginLoader(app, plugins)
    }
    return this.instance
  }
}
