import { RoachRequest, RoachResponse } from './serverTypes'
import { RoachReqMethods } from './routerTypes'
import { RoachPluginError } from '../public/errorHandle'

export interface PluginHook {
  onCreate?: (e?: RoachPluginError) => void
  onError?: (e?: RoachPluginError) => void
  onLoaded?: (e?: RoachPluginError) => void
}

export interface PluginHandler {
  path: string
  dispatch: (request: RoachRequest, response: RoachResponse) => Promise<void>
  method: RoachReqMethods
}

export interface PluginInfo extends PluginHook {
  name: string
  author: string
  version: string
  rootPath?: string
  describe?: string
  usage?: string
  type?: 'core' | 'extra'
  dependencies?: { [name: string]: string }
}

export interface Plugin extends PluginInfo {
  handlers: PluginHandler[]
}

export interface PluginComposed extends Plugin {
  hash: string
}
