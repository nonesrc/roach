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
            const courseTabMap: Map<string, any> = new Map()
            const resolveWeeks = (w: string) => ({ startWeek: w.indexOf('1'), endWeek: w.lastIndexOf('1') })
            tableBody
              .match(/TaskActivity\(.+\s+.+;/g)!
              .map(
                (c) =>
                  /TaskActivity\(.*,"\d+\((?<code>.+)\..+","(?<name>.+)","(?<num>.+)","(?<room>.+)","(?<weekCode>\d+)".*\);\s+.+=(?<col>\d+).+(?<row>\d+)/.exec(
                    c
                  )!.groups
              )
              .forEach((c) => {
                const courseCode = c!.code
                const { name, room, weekCode, col, row } = c!
                if (!courseTabMap.has(courseCode)) {
                  const { name: caseName, ...meta } = courseListMap.get(courseCode)!
                  courseTabMap.set(courseCode, {
                    ...meta,
                    name,
                    room,
                    activated: [
                      {
                        ...resolveWeeks(weekCode),
                        col: +col,
                        row: +row
                      }
                    ]
                  })
                } else {
                  courseTabMap.get(courseCode).activated.push({
                    ...resolveWeeks(weekCode),
                    col: +col,
                    row: +row
                  })
                }
              })
            return [...courseTabMap.values()]
          }
        })
      })
    })
    req.write(new URLSearchParams({ 'setting.kind': 'std', ids }).toString())
    req.end()
  })
}
