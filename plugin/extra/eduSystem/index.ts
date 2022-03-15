import path from 'path'
import fs from 'fs'
import courseTable from './courseTable'
import type { Plugin } from '../../../types/pluginTypes'
import RoachRes from '../../../router/resWrapper'
import { hasProperties } from '../../../utils/helper'

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
      path: '/eduSystem/course/courseData',
      dispatch: async (request, response) => {
        const resWrapper = new RoachRes(response)
        const userData = request.body
        if (hasProperties(userData, ['userId', 'userPwd'])) {
          const ct = (await courseTable(await eduAuth(userData.userId, userData.userPwd))).courseTab
          resWrapper.setStatus(ct).setData(ct)
        } else {
          resWrapper.setMsg('Required userId and userPwd header')
        }
        Promise.resolve(resWrapper.json())
      },
      method: 'post'
    },
    {
      path: '/eduSystem/course/courseData/web',
      dispatch: async (request, response) => {
        const filePath = path.resolve(__dirname, './resource/course.html')
        const stat = fs.statSync(filePath)
        response.writeHead(200, {
          'Content-Type': 'text/html',
          'Content-Length': stat.size
        })
        const readStream = fs.createReadStream(filePath)
        readStream.pipe(response)
      },
      method: 'get'
    }
  ]
}

export default eduSystem
