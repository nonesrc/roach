import easyAuth from './easyAuth'
import type { Plugin } from '../../../types/pluginTypes'
import RoachRes from '../../../router/resWrapper'
import { hasProperties } from '../../../utils/helper'

const easyauth: Plugin = {
  name: 'easyAuth',
  author: 'zRain',
  describe: 'EASY CONNENT登录插件',
  usage: 'POST /easyAuth',
  version: '1.0.0',
  type: 'core',
  handlers: [
    {
      path: '/easyAuth',
      dispatch: async (request, response) => {
        const userData = request.body
        const resWrapper = new RoachRes(response)
        if (hasProperties(userData, ['userId', 'userPwd'], true)) {
          const cookie = await easyAuth(userData.userId, userData.userPwd)
          if (cookie) resWrapper.setData({ cookie }).setStatus(true)
        } else {
          resWrapper.setMsg('userId and userPwd required!')
        }
        Promise.resolve(resWrapper.json())
      },
      method: 'post'
    }
  ]
}

export default easyauth
