import ssoAuth from './ssoAuth'
import { pluginInfoType } from '../../../types/plugin'
import { RoachResponseWrapper } from '../../../utils/wrappers'
import { hasProperties } from '../../../utils/commons'

const ssoauth: pluginInfoType = {
  name: 'ssoAuth',
  author: 'zRain',
  describe: 'CUIT 单点登录插件',
  usage: 'POST /ssoAuth',
  version: '1.0.0',
  routers: [
    {
      path: '/ssoAuth',
      dispatch: async ctx => {
        const userData = ctx.request.body
        const resWrapper = new RoachResponseWrapper()
        if (hasProperties(userData, ['userId', 'userPwd'], true)) {
          const cookie = await ssoAuth(userData.userId, userData.userPwd)
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
