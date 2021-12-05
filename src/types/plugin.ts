import { Context } from 'koa'
import _ from 'koa-route'

export type pluginBaseType = {
  path: string
  dispatch: (ctx: Context) => Promise<void>
  method?: keyof typeof _
  type?: string
  callback?: Function
}
