import chalker from '../utils/chalker'

export default class Notifier {
  public prefix: string
  public body: string
  constructor(prefix: string, body: string) {
    this.prefix = prefix
    this.body = body
  }
  public info() {
    console.log(chalker.info.bold`${this.prefix} ` + this.body)
  }
  public warn() {
    console.log(chalker.warning.bold`${this.prefix} ` + this.body)
  }
  public error() {
    console.log(chalker.error.bold`${this.prefix} ` + this.body)
  }
}
