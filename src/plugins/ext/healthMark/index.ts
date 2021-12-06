import marklist from './markList'
import { pluginInfoType } from '../../../types/plugin'
import { RoachResponseWrapper } from '../../../utils/wrappers'

const markList: pluginInfoType = {
  name: 'healthMark',
  author: 'zRain',
  describe: '一个关于健康打卡的插件',
  usage: 'GET ',
  version:'1.0.0',
  routers: [
    {
      path: '/healthMark/list',
      dispatch: async ctx => {
        const resWrapper = new RoachResponseWrapper()
        await marklist('ASPSESSIONIDCQAAQSDT=AEOJOJBDNCCGBJKOALOILCHD')
        Promise.resolve(resWrapper.res(ctx))
      },
    },
  ],
}

export default markList
