import { RoachRequest, RoachResponse } from './serverTypes'

export type RoachReqMethods = 'get' | 'post' | 'put' | 'delete'

export type RoachRouterOptions = {
  strict: boolean
}

export type RouterHandlerType = (request: RoachRequest, response: RoachResponse, next: Function) => void

export type RoachResHeader = {
  status: boolean
  code?: number
  msg?: string
  [k: string]: any
}

export type RoachResponseWrapper = {
  status: boolean
  data: any
  code?: number
  msg?: string
  [k: string]: any
}
