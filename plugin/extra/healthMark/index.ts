import marklist from './markList'
import type { Plugin } from '../../../types/pluginTypes'
import RoachRes from '../../../router/resWrapper'
import { hasProperties } from '../../../utils/helper'

const markList: Plugin = {
  name: 'healthMark',
  author: 'zRain',
  describe: '一个关于健康打卡的插件，使用post带cookie或带authorization的请求头均可',
  usage: 'POST /healthMark/list [cookie:string]',
  version: '1.0.0',
  type: 'extra',
  handlers: [
    {
      path: '/healthMark/list',
      dispatch: async (request, response) => {
        const userData = request.body
        const { authorization } = request.headers
        const resWrapper = new RoachRes(response)
        if (hasProperties(userData, 'cookie', true) || authorization) {
          const listResult = await marklist(userData.cookie || authorization)
          resWrapper.setStatus(listResult.length !== 0).setData(listResult)
        } else {
          resWrapper.setMsg('No Cookie or authorization header')
        }
        Promise.resolve(resWrapper.json())
      },
      method: 'post'
    }
  ]
}

export default markList
