import { RoachRequest, RoachResponse } from './serverTypes'

export type RoachReqMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type RoachRouterOptions = {
  strict: boolean
}

export type routerHandlerType = (
  request: RoachRequest,
  response: RoachResponse,
  next: Function
) => void
