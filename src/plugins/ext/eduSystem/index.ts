import courseTab from './courseTab'
import { pluginInfoType } from '../../../types/plugin'
import { RoachResponseWrapper } from '../../../utils/wrappers'
import { hasProperties } from '../../../utils/commons'

const eduSystem: pluginInfoType = {
  name: 'eduSystem',
  author: 'zRain',
  describe: 'CUIT教务处',
  usage: 'POST /eduSystem/[...]',
  version: '1.0.0',
  routers: [
    {
      path: '/eduSystem/course/list',
      dispatch: async ctx => {
        const resWrapper = new RoachResponseWrapper()
        await courseTab()
        Promise.resolve(resWrapper.res(ctx))
      },
      method: 'get',
    },
  ],
}

export default eduSystem
