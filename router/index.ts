import { RoachPluginError } from '../public/errorHandle'
import {
  RoachRouterOptions,
  RouterHandlerType,
  RoachReqMethods,
} from '../types/routerTypes'
import { RoachRequest, RoachResponse } from '../types/serverTypes'
import { hashStr, pathToRegex } from '../utils/helper'

declare type RouterImplementation = (
  path: string,
  handle: (request: RoachRequest, response: RoachResponse) => void
) => void
declare type HandlerStackType = 'PR' | 'CE' | 'FI'

const roachReqMethods: RoachReqMethods[] = ['get', 'post', 'put', 'delete']
const defaultOptions: RoachRouterOptions = {
  strict: false,
}

class HandlerStack {
  private stack: Record<HandlerStackType, RouterHandlerType[]>

  constructor(
    priorStack?: RouterHandlerType[],
    centerStack?: RouterHandlerType[],
    finalStack?: RouterHandlerType[]
  ) {
    this.stack = {
      PR: priorStack || [],
      CE: centerStack || [],
      FI: finalStack || [],
    }
  }
  public addHandler(
    handle: RouterHandlerType | RouterHandlerType[],
    stackType: HandlerStackType
  ) {
    if (Array.isArray(handle)) {
      this.stack[stackType].push(...handle)
    } else {
      this.stack[stackType].push(handle)
    }
  }

  public clearStack(stackType?: HandlerStackType[] | HandlerStackType) {
    if (stackType && Array.isArray(stackType)) {
      stackType.forEach(s => (this.stack[s] = []))
    } else if (stackType) {
      this.stack[stackType] = []
    } else {
      this.clearStack(['PR', 'CE', 'FI'])
    }
  }

  public get handlers() {
    return Object.values(this.stack).flat()
  }
}

export default class RoachRouter {
  private static instance: RoachRouter
  private options: RoachRouterOptions
  private handlerStack: HandlerStack
  private routerCollections: Set<string>
  public get!: RouterImplementation
  public post!: RouterImplementation
  public put!: RouterImplementation
  public delete!: RouterImplementation

  constructor(options: RoachRouterOptions) {
    this.options = options
    this.handlerStack = new HandlerStack()
    this.routerCollections = new Set()
    roachReqMethods.forEach(method => {
      Object.defineProperty(this, method, {
        value: (
          path: string,
          handle: (requset: RoachRequest, response: RoachResponse) => void
        ) => {
          const regex = pathToRegex(path, options.strict)
          // Duplicate router handle
          const routerHash = `${method}@${hashStr(path)}`
          // if (!this.routerCollections.has(routerHash)) {
          //   throw new RoachPluginError(`Duplicate router: ${method} ~> ${path}`)
          // }
          this.handlerStack.addHandler(function (requset, response, next) {
            let { pathname } = requset.URL
            let match = regex.exec(pathname)
            if (match && requset.method!.toLowerCase() === method) {
              requset.params = Object.assign({}, requset.params, match.groups)
              handle(requset, response)
            } else {
              next()
            }
          }, 'CE')
          this.routerCollections.add(routerHash)
        },
      })
    })
  }

  public routeHandler(request: RoachRequest, response: RoachResponse) {
    const handlers = this.handlerStack.handlers
    let handlerIndex = 0
    const next = () => {
      let fn = handlers[handlerIndex++]
      if (!fn) return response.status(404).end()
      fn(request, response, next)
    }
    next()
  }
  public use(handle: RouterHandlerType): void
  public use(path: string, handle: RouterHandlerType): void
  public use(
    access: RouterHandlerType | string,
    useHandle?: RouterHandlerType
  ): void {
    if (typeof access === 'string' && useHandle) {
      const regex = pathToRegex(access)
      this.handlerStack.addHandler(function (request, response, next) {
        const { pathname } = request.URL
        const match = regex.exec(pathname)
        if (match) {
          request.params = Object.assign({}, request.params, match.groups)
          useHandle(request, response, next)
        } else {
          next()
        }
      }, 'PR')
    } else {
      this.handlerStack.addHandler(access as RouterHandlerType, 'PR')
    }
  }

  public get routers() {
    return this.routerCollections
  }
  public static getInstance(options: RoachRouterOptions = defaultOptions) {
    if (!RoachRouter.instance) {
      RoachRouter.instance = new RoachRouter(options)
    }
    return RoachRouter.instance
  }
}
