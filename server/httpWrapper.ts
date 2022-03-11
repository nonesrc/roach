import { IncomingMessage, ServerResponse } from 'http'
import type { RoachRequest, RoachResponse } from '../types/serverTypes'
import RoachConfig from '../config'

export function requestWrapper(incomingMessage: IncomingMessage, requestBody: Buffer[]) {
  const url = new URL(incomingMessage.url!, `http://${incomingMessage.headers.host}`)
  Object.defineProperties(incomingMessage, {
    URL: {
      value: url
    },
    rawBody: {
      value: requestBody
    },
    body: {
      get: () => {
        const contentType = incomingMessage.headers['content-type']
        const data = Buffer.concat(requestBody).toString()
        if (contentType === 'application/x-www-form-urlencoded') {
          return Object.fromEntries(new URLSearchParams(data).entries())
        }
        if (contentType === 'application/json') {
          return JSON.parse(data)
        }
        return {}
      }
    },
    query: {
      get: () => {
        const { searchParams } = url
        return Object.fromEntries(searchParams.entries())
      }
    }
  })
  return incomingMessage as RoachRequest
}

export function responseWrapper(serverResponse: ServerResponse) {
  Object.defineProperties(serverResponse, {
    redirect: {
      value: (path: string, callback?: Function) => {
        serverResponse.statusCode = 302
        serverResponse.setHeader('Location', path).end(callback)
      }
    },
    status: {
      value: (status: number) => {
        serverResponse.statusCode = status
        return serverResponse
      }
    },
    json: {
      value: (body: any, callback?: Function) => {
        const json = JSON.stringify(body)
        serverResponse.setHeader('Content-Type', RoachConfig.mimes['.json'])
        serverResponse.setHeader('Content-Length', Buffer.byteLength(json))
        serverResponse.write(json)
        serverResponse.end(callback)
      }
    }
  })
  return serverResponse as RoachResponse
}
