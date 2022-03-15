import chalker from '../utils/chalker'

export default class Tip {
  static success(body: string, prefix?: string) {
    // eslint-disable-next-line
    console.log(chalker.success.bold`${prefix} ` + body)
  }

  static info(body: string, prefix?: string) {
    // eslint-disable-next-line
    console.log(chalker.info.bold`${prefix} ` + body)
  }

  static warn(body: string, prefix?: string) {
    // eslint-disable-next-line
    console.log(chalker.warning.bold`${prefix} ` + body)
  }

  static error(body: string, prefix?: string) {
    // eslint-disable-next-line
    console.log(chalker.error.bold`${prefix} ` + body)
  }
}
