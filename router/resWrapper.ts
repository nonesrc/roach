import type { RoachResponseWrapper } from '../types/routerTypes'
import type { RoachResponse } from '../types/serverTypes'

export default class RoachRes {
  public options: RoachResponseWrapper

  private response: RoachResponse

  constructor(response: RoachResponse, options?: RoachResponseWrapper) {
    this.response = response
    this.options = options || {
      status: false,
      data: null
    }
    this.options.msg = this.options.msg || 'Roach APIs. See: https://github.com/nonesrc/roach'
  }

  public setMsg(msg: string) {
    this.options.msg = msg
    return this
  }

  public setCode(code: number) {
    this.options.code = code
    return this
  }

  public setStatus(status: any = false) {
    this.options.status = Boolean(status)
    return this
  }

  public setData(data: any) {
    this.options.data = data
    return this
  }

  public json() {
    this.response.json(this.options)
  }
}
