import { pluginBaseType } from '../types/plugin'
import _ from 'koa-route'

export default function roachPluginLoader(
  app: any,
  plugins: pluginBaseType[][] = []
) {
  const pluginCollections: pluginBaseType[][] = plugins
  const pluginFormat = function (
    pluginRouter: pluginBaseType
  ): Required<pluginBaseType> {
    return {
      path: pluginRouter.path,
      dispatch: pluginRouter.dispatch,
      method: pluginRouter.method || 'get',
      type: pluginRouter.type || 'application/json',
      callback: pluginRouter.callback || function () {},
    }
  }
  const installer = function (plugin: pluginBaseType[]) {
    for (const router of plugin) {
      const pluginFormated = pluginFormat(router)
      app.use(
        _[pluginFormated.method](pluginFormated.path, async ctx => {
          await pluginFormated.dispatch(ctx)
          pluginFormated.callback()
          ctx.response.type = pluginFormated.type
        })
      )
    }
  }

  for (const plugin of pluginCollections) installer(plugin)

  return { pluginFormat, installer }
}
