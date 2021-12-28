import { get } from 'http'
import cheerio from 'cheerio'
import iconv from 'iconv-lite'

declare type markType = {
  banner: string
  start: number
  end: number
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
        const $ = cheerio.load(iconv.decode(Buffer.concat(chunks), 'gb2312'))
        const result: markType[] = []
        $('table.tabThinM tbody:nth-child(2) tr[valign="top"]').each(
          function () {
            const marker = $('td:nth-child(1)', this).text().trim()
            const banner = $('td:nth-child(2) a', this)
            const link = banner.attr('href')!.valueOf()
            const timesmap = $('td:nth-child(3)', this)
              .text()
              .match(/\d{4}.*?:\d{2}/g)
            const dateVerify = timesmap !== null && timesmap.length === 2
            result.push({
              banner: banner.text(),
              start: new Date(dateVerify ? timesmap[0] : 0).getTime(),
              end: new Date(dateVerify ? timesmap[1] : 0).getTime(),
              isMarked: marker.length === 1 && marker === '√',
              link: /^http/.test(link)
                ? link
                : 'http://jszx-jxpt.cuit.edu.cn/Jxgl/Xs/netks/' + link,
            })
          }
        )
        resolve(result)
      })
    })
  })
}
