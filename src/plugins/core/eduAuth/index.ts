import eduAuth from './eduAuth'
import { pluginInfoType } from '../../../types/plugin'
import { RoachResponseWrapper } from '../../../utils/wrappers'
import { hasProperties } from '../../../utils/commons'

const ssoauth: pluginInfoType = {
  name: 'eduAuth',
  author: 'zRain',
  describe: 'CUIT教务处登录',
  usage: 'POST /eduAuth',
  version: '1.0.0',
  routers: [
    {
      path: '/eduAuth',
      dispatch: async ctx => {
        const userData = ctx.request.body
        const resWrapper = new RoachResponseWrapper()
        if (hasProperties(userData, ['userId', 'userPwd'], true)) {
          const cookie = await eduAuth(userData.userId, userData.userPwd)
          if (cookie) resWrapper.setData(cookie).setStatus(true)
        } else {
          resWrapper.setMsg('userId and userPwd required!')
        }
        Promise.resolve(resWrapper.res(ctx))
      },
      method: 'post',
    },
  ],
}

export default ssoauth
