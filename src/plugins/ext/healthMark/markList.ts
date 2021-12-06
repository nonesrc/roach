import { get } from 'http'
import cheerio from 'cheerio'
import iconv from 'iconv-lite'

declare type markType = {
  banner: string
  start: Date
  end: Date
  isMarked: boolean
  link: string
}

export default function getMarkList(cookie: string): Promise<markType[]> {
  const targetURL =
    'http://jszx-jxpt.cuit.edu.cn/Jxgl/Xs/netKs/sj.asp?UTp=Xs&jkdk=Y'
  return new Promise(function (resolve) {
    get(targetURL, { headers: { Cookie: cookie } }, function (res) {
      if (res.statusCode !== 200) return resolve([])
      const chunks: Buffer[] = []
      res.on('data', function (chunk) {
        chunks.push(chunk)
      })
      res.on('end', function () {
        const html = cheerio.load(iconv.decode(Buffer.concat(chunks), 'gb2312'))
        const result: markType[] = []
        html('table.tabThinM tbody:nth-child(2) tr[valign="top"]')
        resolve([])
      })
    })
  })
}
