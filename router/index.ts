import RoachError from '../public/errorHandle'
import Notifier from '../public/notifier'
import { PluginInfo } from '../types/pluginTypes'
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
  public routerCollections: Map<string, PluginInfo>
  public get!: RouterImplementation
  public post!: RouterImplementation
  public put!: RouterImplementation
  public delete!: RouterImplementation

  constructor(options: RoachRouterOptions) {
    this.options = options
    this.handlerStack = new HandlerStack()
    this.routerCollections = new Map()
    roachReqMethods.forEach(method => {
      Object.defineProperty(this, method, {
        value: (
          path: string,
          handle: (requset: RoachRequest, response: RoachResponse) => void
        ) => {
          const regex = pathToRegex(path, options.strict)
          // Duplicate router handle
          if (this.routerCollections.has(`${method}@${hashStr(path)}`)) {
            return new Notifier(
              'RoachError',
              `duplicate router: ${method} ~> ${path}, this route would not be loaded!`
            ).error()
          }
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
          new Notifier(
            'RoachInfo',
            `${method} ~> ${path} load successed!`
          ).info()
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
      // Duplicate router handle
      console.log([...this.routerCollections.keys()])

      if (this.routerCollections.has(hashStr(access))) {
        return new Notifier(
          'RoachError',
          `duplicate router in use: * ~> ${access}, this route would not be loaded!`
        ).warn()
      }
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
      this.routerCollections.set(hashStr(access), {
        name: '__use__',
        author: '',
        version: '',
      })
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
