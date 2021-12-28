import { RoachRequest, RoachResponse } from './serverTypes'
import { RoachReqMethods } from './routerTypes'
import { RoachPluginError } from '../public/errorHandle'
import serverCTX from '../public/ctx'

export interface PluginHook {
  onCreate?: (ctx: serverCTX) => void
  onError?: (error: RoachPluginError) => void
  onLoaded?: (ctx: serverCTX) => void
}

export interface PluginHandler {
  path: string
  dispatch: (request: RoachRequest, response: RoachResponse) => Promise<void>
  method: RoachReqMethods
}

export interface PluginInfo {
  name: string
  author: string
  version: string
  rootPath?: string
  describe?: string
  usage?: string
  type?: 'core' | 'extra'
  dependencies?: { [name: string]: string }
}

export interface Plugin extends PluginInfo, PluginHook {
  handlers: PluginHandler[]
}

export interface PluginComposed extends Plugin {
  hash: string
}
