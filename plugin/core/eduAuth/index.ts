import eduAuth from './eduAuth'
import type { Plugin } from '../../../types/pluginTypes'
import RoachRes from '../../../router/resWrapper'
import { hasProperties } from '../../../utils/helper'

const ssoauth: Plugin = {
  name: 'eduAuth',
  author: 'zRain',
  describe: 'CUIT教务处登录',
  usage: 'POST /eduAuth',
  version: '1.0.0',
  type: 'core',
  dependencies: {
    easyAuth: '1.0.0'
  },
  handlers: [
    {
      path: '/eduAuth',
      dispatch: async (request, response) => {
        const userData = request.body
        const resWrapper = new RoachRes(response)
        if (hasProperties(userData, ['userId', 'userPwd'], true)) {
          const cookie = await eduAuth(userData.userId, userData.userPwd)
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
