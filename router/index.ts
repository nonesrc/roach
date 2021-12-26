import {
  RoachRouterOptions,
  routerHandlerType,
  RoachReqMethods,
} from '../types/routerTypes'
import { RoachRequest, RoachResponse } from '../types/serverTypes'
import { pathToRegex } from '../utils/helper'

declare type RouterImplementation = (
  path: string,
  handle: (request: RoachRequest, response: RoachResponse) => void
) => void
declare type HandlerStackType = 'PR' | 'CE' | 'FI'

const roachReqMethods: RoachReqMethods[] = ['GET', 'POST', 'PUT', 'DELETE']
const defaultOptions: RoachRouterOptions = {
  strict: false,
}

class HandlerStack {
  private stack: Record<HandlerStackType, routerHandlerType[]>

  constructor(
    priorStack?: routerHandlerType[],
    centerStack?: routerHandlerType[],
    finalStack?: routerHandlerType[]
  ) {
    this.stack = {
      PR: priorStack || [],
      CE: centerStack || [],
      FI: finalStack || [],
    }
  }
  public addHandler(
    handle: routerHandlerType | routerHandlerType[],
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
  public get!: RouterImplementation
  public post!: RouterImplementation
  public put!: RouterImplementation
  public delete!: RouterImplementation

  constructor(options: RoachRouterOptions) {
    this.options = options
    this.handlerStack = new HandlerStack()
    roachReqMethods.forEach(method => {
      Object.defineProperty(this, method.toLowerCase(), {
        value: (path: string, handle: (...arg: any) => void) => {
          const regex = pathToRegex(path, options.strict)
          this.handlerStack.addHandler(function (requset, response, next) {
            let { pathname } = requset.URL
            let match = regex.exec(pathname)
            if (match && requset.method!.toUpperCase() === method) {
              requset.params = Object.assign({}, requset.params, match.groups)
              handle(requset, response)
            } else {
              next()
            }
          }, 'CE')
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
  public use(handle: routerHandlerType): void
  public use(path: string, handle: routerHandlerType): void
  public use(
    access: routerHandlerType | string,
    useHandle?: routerHandlerType
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
      this.handlerStack.addHandler(access as routerHandlerType, 'PR')
    }
  }
  public static getInstance(options: RoachRouterOptions = defaultOptions) {
    if (!RoachRouter.instance) {
      RoachRouter.instance = new RoachRouter(options)
    }
    return RoachRouter.instance
  }
}
