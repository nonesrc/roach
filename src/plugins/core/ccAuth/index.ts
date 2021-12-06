import ccauth from './ccAuth'
import ccsignout from './ccSignout'
import { pluginInfoType } from '../../../types/plugin'
import { hasProperties } from '../../../utils/commons'
import { RoachResponseWrapper } from '../../../utils/wrappers'

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
        const resWrapper = new RoachResponseWrapper()
        const userData = ctx.request.body
        if (hasProperties(userData, ['userName', 'userPwd'], true)) {
          const [activedCookie, blankCookie] = await ccauth(
            userData.userName,
            userData.userPwd
          )
          resWrapper.setStatus(true).setData({ activedCookie, blankCookie })
        } else {
          resWrapper
            .setStatus(false)
            .setMsg('Require only 2 post params: userName userPwd!')
        }
        Promise.resolve(resWrapper.res(ctx))
      },
    },
    {
      path: '/ccAuth/signout',
      method: 'post',
      dispatch: async ctx => {
        const resWrapper = new RoachResponseWrapper()
        const userData = ctx.request.body
        if (hasProperties(userData, ['activedCookie', 'blankCookie'], true)) {
          resWrapper.setStatus(
            await ccsignout(userData.activedCookie, userData.blankCookie)
          )
        } else {
          resWrapper
            .setStatus(false)
            .setMsg('Require only 2 post params: activedCookie blankCookie!')
        }
        Promise.resolve(resWrapper.res(ctx))
      },
    },
  ],
}

export default ccAuth
