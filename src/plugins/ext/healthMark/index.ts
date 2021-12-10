import marklist from './markList'
import { pluginInfoType } from '../../../types/plugin'
import { RoachResponseWrapper } from '../../../utils/wrappers'
import { hasProperties } from '../../../utils/commons'

const markList: pluginInfoType = {
  name: 'healthMark',
  author: 'zRain',
  describe:
    '一个关于健康打卡的插件，使用post带cookie或带authorization的请求头均可',
  usage: 'POST /healthMark/list [cookie:string]',
  version: '1.0.0',
  routers: [
    {
      path: '/healthMark/list',
      dispatch: async ctx => {
        const userData = ctx.request.body
        const authorization = ctx.request.headers['authorization']
        const resWrapper = new RoachResponseWrapper()
        if (hasProperties(userData, 'cookie', true) || authorization) {
          const listResult = await marklist(userData.cookie || authorization)
          resWrapper.setStatus(listResult.length !== 0).setData(listResult)
        } else {
          resWrapper.setMsg('No Cookie or authorization header')
        }
        Promise.resolve(resWrapper.res(ctx))
      },
      method: 'post',
    },
  ],
}

export default markList
