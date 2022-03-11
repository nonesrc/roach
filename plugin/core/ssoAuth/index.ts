import ssoAuth from './ssoAuth'
import type { Plugin } from '../../../types/pluginTypes'
import RoachRes from '../../../router/resWrapper'
import { hasProperties } from '../../../utils/helper'

const ssoauth: Plugin = {
  name: 'ssoAuth',
  author: 'zRain',
  describe: 'CUIT 单点登录插件',
  usage: 'POST /ssoAuth',
  version: '1.0.0',
  type: 'core',
  dependencies: {
    easyAuth: '1.0.0'
  },
  handlers: [
    {
      path: '/ssoAuth',
      dispatch: async (request, response) => {
        const userData = request.body
        const resWrapper = new RoachRes(response)
        if (hasProperties(userData, ['userId', 'userPwd'], true)) {
          const cookie = await ssoAuth(userData.userId, userData.userPwd)
          if (cookie) resWrapper.setData(cookie).setStatus(true)
        } else {
          resWrapper.setMsg('userId and userPwd required!')
        }
        Promise.resolve(resWrapper.json())
      },
      method: 'post'
    }
  ]
}

export default ssoauth
