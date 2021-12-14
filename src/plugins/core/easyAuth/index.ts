import easyAuth from './easyAuth'
import { pluginInfoType } from '../../../types/plugin'
import { RoachResponseWrapper } from '../../../utils/wrappers'
import { hasProperties } from '../../../utils/commons'

const markList: pluginInfoType = {
  name: 'easyAuth',
  author: 'zRain',
  describe: 'EASY CONNENT登录插件',
  usage: 'POST /easyAuth',
  version: '1.0.0',
  routers: [
    {
      path: '/easyAuth',
      dispatch: async ctx => {
        const userData = ctx.request.body
        const resWrapper = new RoachResponseWrapper()
        if (hasProperties(userData, ['userId', 'userPwd'], true)) {
          const cookie = await easyAuth(userData.userId, userData.userPwd)
          if (cookie) resWrapper.setData({ cookie }).setStatus(true)
        } else {
          resWrapper.setMsg('userId and userPwd required!')
        }
        Promise.resolve(resWrapper.res(ctx))
      },
      method: 'post',
    },
  ],
}

export default markList
