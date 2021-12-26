import { IncomingMessage, ServerResponse } from 'http'

export type RoachRequest = IncomingMessage & {
  URL: URL
  rawBody: Buffer[]
  body: { [k: string]: any }
  query: { [k: string]: any }
  params: { [k: string]: any }
  cookie: { [k: string]: any }
}

export type RoachResponse = ServerResponse & {
  redirect: (path: string, callback?: Function) => void
  status: (status: number) => RoachResponse
  json: (body: any, callback?: Function) => void
}
