import { auth } from './ccAuth'
import { pluginInfoType } from '../../../types/plugin'

const ccAuth: pluginInfoType = {
  name: 'ccAuth',
  author: 'zRain',
  describe: '一个获取计算中心cookie的插件',
  usage: 'POST /ccAuth [userName:string,userPwd]',
  routers: [
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
  ],
}

export default ccAuth
