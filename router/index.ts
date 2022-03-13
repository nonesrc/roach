import Tip from '../public/tip'
import HandlerStack from './handlerStack'
import type { PluginInfo } from '../types/pluginTypes'
import type { RoachRouterOptions, RouterHandlerType, RoachReqMethods } from '../types/routerTypes'
import type { RoachRequest, RoachResponse } from '../types/serverTypes'
import { hashStr, pathToRegex } from '../utils/helper'

declare type RouterImplementation = (path: string, handle: (request: RoachRequest, response: RoachResponse) => void) => void

const roachReqMethods: RoachReqMethods[] = ['get', 'post', 'put', 'delete']
const defaultOptions: RoachRouterOptions = {
  strict: false
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
    roachReqMethods.forEach((method) => {
      Object.defineProperty(this, method, {
        value: (path: string, handle: (requset: RoachRequest, response: RoachResponse) => void) => {
          const regex = pathToRegex(path, options.strict)
          // Duplicate router handle
          // BUG 'use' Router did not inspected!
          if (this.routerCollections.has(`${method}@${hashStr(path)}`)) {
            Tip.error('RoachError', `duplicate router: ${method} ~> ${path}, this route would not be loaded!`)
          } else {
            this.handlerStack.addHandler((requset, response, next) => {
              const { pathname } = requset.URL
              const match = regex.exec(pathname)
              if (match && requset.method!.toLowerCase() === method) {
                requset.params = { ...requset.params, ...match.groups }
                handle(requset, response)
              } else {
                next()
              }
            }, 'CE')
            Tip.info('*', `${method} ~> ${path} OK!`)
          }
        }
      })
    })
  }

  public routeHandler(request: RoachRequest, response: RoachResponse) {
    const { handlers } = this.handlerStack
    let handlerIndex = 0
    const next = () => {
      const fn = handlers[handlerIndex]
      handlerIndex += 1
      if (fn) {
        fn(request, response, next)
      } else {
        response.status(404).end()
      }
    }
    next()
  }

  public use(handle: RouterHandlerType): void

  public use(path: string, handle: RouterHandlerType): void

  public use(access: RouterHandlerType | string, useHandle?: RouterHandlerType): void {
    if (typeof access === 'string' && useHandle) {
      const regex = pathToRegex(access)
      // Duplicate 'use' router handle
      if (this.routerCollections.has(hashStr(access))) {
        Tip.warn('RoachError', `duplicate router in use: * ~> ${access}, this route would not be loaded!`)
      } else {
        this.handlerStack.addHandler((request, response, next) => {
          const { pathname } = request.URL
          const match = regex.exec(pathname)
          if (match) {
            request.params = { ...request.params, ...match.groups }
            useHandle(request, response, next)
          } else {
            next()
          }
        }, 'PR')
        this.routerCollections.set(hashStr(access), {
          name: '__use__',
          author: '',
          version: ''
        })
      }
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
