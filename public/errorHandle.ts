import Notifier from './notifier'

export default class RoachError extends Error {
  public errorNotifier: Notifier

  constructor(perfix: string, body: string)

  constructor(notifier: Notifier)

  constructor(access: string | Notifier, body?: string) {
    super(typeof access === 'string' ? access : access.body)
    this.errorNotifier = typeof access === 'string' ? new Notifier(access, body!) : access
  }

  public notify() {
    this.errorNotifier.error()
  }
}
