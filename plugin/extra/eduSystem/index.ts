import courseTab from './courseTab'
import { Plugin } from '../../../types/pluginTypes'
import RoachRes from '../../../router/resWrapper'

// Dependent plugins
import eduAuth from '../../core/eduAuth/eduAuth'

const eduSystem: Plugin = {
  name: 'eduSystem',
  author: 'zRain',
  describe: 'CUIT教务处',
  usage: 'POST /eduSystem/[...]',
  version: '1.0.0',
  type: 'extra',
  handlers: [
    {
      path: '/eduSystem/course/list',
      dispatch: async (request, response) => {
        const resWrapper = new RoachRes(response)
        const cookie = await eduAuth('??', '??')
        await courseTab(cookie)
        Promise.resolve(resWrapper.json())
      },
      method: 'post',
    },
  ],
}

export default eduSystem
