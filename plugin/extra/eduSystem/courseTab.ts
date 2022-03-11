import { get, request, RequestOptions } from 'http'

function activeCookie(cookie: string): Promise<void> {
  return new Promise((resolve) => {
    const req = get('http://jwgl-cuit-edu-cn.webvpn.cuit.edu.cn:8118/eams/courseTableForStd.action', { headers: { Cookie: cookie } })
    req.on('response', (res) => {
      if (res.statusCode === 200) {
        resolve()
      }
    })
  })
}

export default async function courseTab(cookie: string): Promise<void> {
  await activeCookie(cookie)
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
        const body = Buffer.concat(chunks)
        // eslint-disable-next-line
        console.log(body.toString())
        resolve()
      })
    })

    req.write(new URLSearchParams({ 'setting.kind': 'std', ids: '105363' }).toString())
    req.end()
  })
}
