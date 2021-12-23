import courseTab from './courseTab'
import { pluginInfoType } from '../../../types/plugin'
import { RoachResponseWrapper } from '../../../utils/wrappers'
import { hasProperties } from '../../../utils/commons'

// Dependent plugins
import eduAuth from '../../core/eduAuth/eduAuth'

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
        const cookie = await eduAuth('2019121166', '13420098228a')
        await courseTab(cookie)
        Promise.resolve(resWrapper.res(ctx))
      },
      method: 'post',
    },
  ],
}

export default eduSystem
