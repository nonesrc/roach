import { roachResType } from '../types/wrapper'
import { Context } from 'koa'

export class RoachResponseWrapper {
  public options: roachResType
  constructor(options?: roachResType) {
    this.options = options || {
      status: false,
      data: null,
    }
    this.options.msg =
      this.options.msg || 'Roach APIs. See: https://github.com/nonesrc/roach'
  }
  public setMsg(msg: string) {
    this.options.msg = msg
    return this
  }
  public setCode(code: number) {
    this.options.code = code
    return this
  }
  public setStatus(status: boolean) {
    this.options.status = status
    return this
  }
  public setData(data: any) {
    this.options.data = data
    return this
  }
  public res(ctx: Context) {
    ctx.response.body = this.options
  }
}
