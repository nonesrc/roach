import { RoachRequest, RoachResponse } from './serverTypes'
import { RoachReqMethods } from './routerTypes'

export interface PluginHandler {
  path: string
  dispatch: (request: RoachRequest, response: RoachResponse) => Promise<void>
  method: RoachReqMethods
  onCreate?: Function
  onLoaded?: Function
  onError?: Function
  onSuccess?: Function
  dependencies?: { [name: string]: string }
}

export type PluginInfo = {
  name: string
  author: string
  version: string
  rootPath?: string
  describe?: string
  usage?: string
  type?: 'core' | 'extra'
}

export interface Plugin extends PluginInfo {
  handlers: PluginHandler[]
}

export interface PluginComposed extends Plugin {
  hash: string
}
