import { get, request, RequestOptions } from 'http'
import { load } from 'cheerio'
import type { Course, CourseTab } from './types'

function activeCookie(cookie: string): Promise<string> {
  return new Promise((resolve) => {
    const req = get('http://jwgl-cuit-edu-cn.webvpn.cuit.edu.cn:8118/eams/courseTableForStd.action', { headers: { Cookie: cookie } })
    req.on('response', (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        resolve(
          Buffer.concat(chunks)
            .toString()
            .match(/(?<=ids",")\d+/g)![0]
        )
      })
    })
  })
}

function getCourseListMap(tableBody: string) {
  const courseListMap: Map<string, Course> = new Map()
  const courseKeys: (keyof Course)[] = ['code', 'name', 'credit', 'courseIdx', 'class', 'teacher']
  const $ = load(tableBody)
  $('table[id^=grid] tbody tr').each(function courseTr() {
    const { code, ...meta } = Object.fromEntries(
      $('td', this)
        .toArray()
        .slice(1, 7)
        .map((c, i) => [courseKeys[i], $(c).text().replace(/\s/g, '')])
    ) as Course
    courseListMap.set(code, { code, ...meta })
  })
  return courseListMap
}

export default async function getCourseTable(cookie: string): Promise<{ courseList: Course[]; courseTab: CourseTab[] }> {
  const ids = await activeCookie(cookie)
  return new Promise((resolve) => {
    const options: RequestOptions = {
      method: 'POST',
      hostname: 'jwgl-cuit-edu-cn.webvpn.cuit.edu.cn',
      port: '8118',
      path: '/eams/courseTableForStd!courseTable.action?sf_request_type=ajax',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    const req = request(options, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        const tableBody = Buffer.concat(chunks).toString()
        const courseListMap = getCourseListMap(tableBody)
        resolve({
          get courseList() {
            return [...courseListMap.values()]
          },
          get courseTab() {
            const resolveWeeks = (weekCode: string) => {
              const startWeek = weekCode.indexOf('1')
              const endWeek = weekCode.lastIndexOf('1')
              const nextWeekStatus = weekCode[startWeek + 1] || '1'
              const rule = nextWeekStatus === '1' ? '全' : startWeek % 2 === 0 ? '双' : '单'
              return {
                startWeek,
                endWeek,
                rule
              }
            }
            const resolveCoordinates = (coordinates: string) => {
              const locationArr = []
              const numArr = coordinates.match(/(\d+)(?=\*)|(?<=\+)(\d)/g)?.map((numStr) => parseInt(numStr, 10))
              if (numArr) {
                while (numArr.length) {
                  locationArr.push(numArr.splice(0, 2))
                }
              }
              return locationArr as [number, number][]
            }
            const resolveCourseGroup = (tableString: string) => {
              const courseTabMap: Map<string, any> = new Map()
              let course
              const courseRegExp =
                /TaskActivity\(.*,"\d+\((?<code>.+)\..+","(?<name>.+)","(?<num>.+)","(?<room>.+)","(?<weekCode>\d+)".*\);(?<coordinates>[\d\D]*?)var/g
              while ((course = courseRegExp.exec(tableString)) !== null) {
                if (course.groups) {
                  const { code, room, weekCode, coordinates, ...courseTabMetas } = course.groups
                  const activity = {
                    room,
                    coordinates: resolveCoordinates(coordinates),
                    ...resolveWeeks(weekCode)
                  }
                  if (courseTabMap.has(code)) {
                    courseTabMap.get(code).activities.push(activity)
                  } else {
                    const { name, ...courseListMetas } = courseListMap.get(code)!
                    courseTabMap.set(code, {
                      ...courseTabMetas,
                      ...courseListMetas,
                      activities: [activity]
                    })
                  }
                }
              }
              return courseTabMap
            }
            return [...resolveCourseGroup(tableBody).values()]
          }
        })
      })
    })
    req.write(new URLSearchParams({ 'setting.kind': 'std', ids, 'semester.id': '106' }).toString())
    req.end()
  })
}
