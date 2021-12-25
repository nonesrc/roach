import {
  RoachRouterOptions,
  RoachRequest,
  RoachResponse,
  routerHandlerType,
  RoachReqMethods,
} from '../types/routerTypes'

declare type RouterImplementation = (
  path: string,
  handle: (request: RoachRequest, response: RoachResponse) => void
) => void

const roachReqMethods: RoachReqMethods[] = ['GET', 'POST', 'PUT', 'DELETE']
const defaultOptions: RoachRouterOptions = {
  strict: false,
}

function pathToRegex(path: string, exact = false) {
  return new RegExp(
    (exact ? '^' : '') +
      path
        .replace(/:(\w+)\?\//g, '((?<$1>.+?)/)?')
        .replace(/:(\w+)/g, '(?<$1>.+?)')
        .replace(/\/+/g, '\\/') +
      (exact ? '$' : '')
  )
}

export default class RoachRouter {
  private static instance: RoachRouter
  private options: RoachRouterOptions
  private routerStack: routerHandlerType[]
  public get!: RouterImplementation
  public post!: RouterImplementation
  public put!: RouterImplementation
  public delete!: RouterImplementation
  constructor(options: RoachRouterOptions) {
    this.options = options
    this.routerStack = []
    roachReqMethods.forEach(method => {
      Object.defineProperty(this, method.toLowerCase(), {
        value: (path: string, handle: (...arg: any) => void) => {
          const regex = pathToRegex(path, options.strict)
          this.routerStack.push(function (requset, response, next) {
            let { pathname } = requset.URL
            let match = regex.exec(pathname)
            if (match && requset.method!.toUpperCase() === method) {
              requset.params = Object.assign({}, requset.params, match.groups)
              handle(requset, response)
            } else {
              next()
            }
          })
        },
      })
    })
  }

  public routeHandler(request: RoachRequest, response: RoachResponse) {
    let handlerIndex = 0
    const next = () => {
      let fn = this.routerStack[handlerIndex++]
      if (!fn) return response.status(404).end()
      fn(request, response, next)
    }
    next()
  }

  public static getInstance(options: RoachRouterOptions = defaultOptions) {
    if (!RoachRouter.instance) {
      RoachRouter.instance = new RoachRouter(options)
    }
    return RoachRouter.instance
  }
}
