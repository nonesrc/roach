import { IncomingMessage, ServerResponse } from 'http'

export type RoachReqMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type RoachRouterOptions = {
  strict: boolean
}

export type RoachRequest = IncomingMessage & {
  URL: URL
  rawBody: Buffer[]
  body: { [k: string]: any }
  query: { [k: string]: any }
  params: { [k: string]: any }
}

export type RoachResponse = ServerResponse & {
  redirect: (path: string, callback?: Function) => void
  status: (status: number) => RoachResponse
  json: (body: any, callback?: Function) => void
}

export type routerHandlerType = (
  request: RoachRequest,
  response: RoachResponse,
  next: Function
) => void
