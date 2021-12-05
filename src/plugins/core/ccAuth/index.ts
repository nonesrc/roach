import { auth } from './ccAuth'
import { pluginBaseType } from '../../../types/plugin'

const Routers: pluginBaseType[] = [
  {
    path: '/ccAuth',
    method: 'post',
    dispatch: async ctx => {
      const userData = ctx.request.body
      let userActiveCookie = ''
      if (
        (Object.prototype.hasOwnProperty.call(userData, 'userName') &&
          Object.prototype.hasOwnProperty.call(userData, 'userPwd')) ||
        Object.keys(userData).length === 2
      ) {
        userActiveCookie = await auth(
          userData.userName as string,
          userData.userPwd as string
        )
      }
      ctx.body = { userActiveCookie }
      Promise.resolve()
    },
  },
]

export default Routers
