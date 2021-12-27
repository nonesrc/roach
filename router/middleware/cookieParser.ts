import { RouterHandlerType } from '../../types/routerTypes'

const cookieParser: RouterHandlerType = (request, response, next) => {
  const cookie = request.headers['cookie'] || ''
  request.cookie = Object.fromEntries(
    new URLSearchParams(
      cookie
        .split(';')
        .map(i => i.trim())
        .join('&')
    )
  )
  next()
}

export default cookieParser
