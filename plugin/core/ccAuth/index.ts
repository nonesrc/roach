import ccauth from './ccAuth'
import ccsignout from './ccSignout'
import { Plugin } from '../../../types/pluginTypes'
import { hasProperties } from '../../../utils/helper'
import { RoachRes } from '../../../router/resWrapper'

const ccAuth: Plugin = {
  name: 'ccAuth',
  author: 'zRain',
  describe: '一个获取计算中心cookie的插件',
  usage: 'POST /ccAuth [userName:string,userPwd]',
  version: '1.0.0',
  type: 'core',
  handlers: [
    {
      path: '/ccAuth',
      method: 'post',
      dispatch: async (request, response) => {
        const resWrapper = new RoachRes()
        const userData = request.body
        if (hasProperties(userData, ['userId', 'userPwd'], true)) {
          const [activedCookie, blankCookie] = await ccauth(
            userData.userId,
            userData.userPwd
          )
          resWrapper.setStatus(true).setData({ activedCookie, blankCookie })
        } else {
          resWrapper
            .setStatus(false)
            .setMsg('Require only 2 post params: userName userPwd!')
        }
        Promise.resolve(resWrapper.json(response))
      },
    },
    {
      path: '/ccAuth/signout',
      method: 'post',
      dispatch: async (request, response) => {
        const resWrapper = new RoachRes()
        const userData = request.body
        if (hasProperties(userData, ['activedCookie', 'blankCookie'], true)) {
          resWrapper.setStatus(
            await ccsignout(userData.activedCookie, userData.blankCookie)
          )
        } else {
          resWrapper
            .setStatus(false)
            .setMsg('Require only 2 post params: activedCookie blankCookie!')
        }
        Promise.resolve(resWrapper.json(response))
      },
    },
  ],
}

export default ccAuth
