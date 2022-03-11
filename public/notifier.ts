import chalker from '../utils/chalker'

export default class Notifier {
  public prefix: string

  public body: string

  constructor(prefix: string, body: string) {
    this.prefix = prefix
    this.body = body
  }

  public success() {
    // eslint-disable-next-line
    console.log(chalker.success.bold`${this.prefix} ` + this.body)
  }

  public info() {
    // eslint-disable-next-line
    console.log(chalker.info.bold`${this.prefix} ` + this.body)
  }

  public warn() {
    // eslint-disable-next-line
    console.log(chalker.warning.bold`${this.prefix} ` + this.body)
  }

  public error() {
    // eslint-disable-next-line
    console.log(chalker.error.bold`${this.prefix} ` + this.body)
  }
}
