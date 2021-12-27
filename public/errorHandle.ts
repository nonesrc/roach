class RoachError extends Error {
  constructor(msg: string) {
    super(msg)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class RoachPluginError extends RoachError {
  constructor(msg: string) {
    super(msg)
  }
}

export class RoachRouterError extends RoachError {
  constructor(msg: string) {
    super(msg)
  }
}

export class RoachServerError extends RoachError {
  constructor(msg: string) {
    super(msg)
  }
}
