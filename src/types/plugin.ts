import { Context } from 'koa'
import _ from 'koa-route'

export interface pluginRouterType {
  path: string
  dispatch: (ctx: Context) => Promise<void>
  method?: keyof typeof _
  type?: string
  callback?: Function
}
export type pluginAbstractType = {
  name: string
  describe?: string
  usage?: string
  author?: string
  version?: string
}

export interface pluginInfoType extends pluginAbstractType {
  routers: pluginRouterType[]
  hash?: string
}
