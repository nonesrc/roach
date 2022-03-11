import type { RouterHandlerType } from '../types/routerTypes'

declare type HandlerStackType = 'PR' | 'CE' | 'FI'

export default class HandlerStack {
  private stack: Record<HandlerStackType, RouterHandlerType[]>

  constructor(priorStack?: RouterHandlerType[], centerStack?: RouterHandlerType[], finalStack?: RouterHandlerType[]) {
    this.stack = {
      PR: priorStack || [],
      CE: centerStack || [],
      FI: finalStack || []
    }
  }

  public addHandler(handle: RouterHandlerType | RouterHandlerType[], stackType: HandlerStackType) {
    if (Array.isArray(handle)) {
      this.stack[stackType].push(...handle)
    } else {
      this.stack[stackType].push(handle)
    }
  }

  public clearStack(stackType?: HandlerStackType[] | HandlerStackType) {
    if (stackType && Array.isArray(stackType)) {
      stackType.forEach((s) => {
        this.stack[s] = []
      })
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
