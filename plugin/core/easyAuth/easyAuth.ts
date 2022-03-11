import { get, request } from 'https'
import { load } from 'cheerio'
// @ts-ignore
import RSAKey from './encrypt'

function getTWFID(): Promise<string> {
  return new Promise((resolve) => {
    const req = get('https://webvpn.cuit.edu.cn/por/login_auth.csp?apiversion=1')
    req.on('response', (res) => {
      resolve(`TWFID=${res.headers.twfid || ''}`)
    })
  })
}

async function getPswConf(TWFID: string): Promise<[string, string]> {
  return new Promise((resolve) => {
    get('https://webvpn.cuit.edu.cn/public/psw_config?apiversion=1', { headers: { Cookie: TWFID } }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const $ = load(Buffer.concat(chunks).toString())
        resolve([$('RSA_ENCRYPT_KEY').text() || '', $('CSRF_RAND_CODE').text() || ''])
      })
    })
  })
}

export default async function easyAuth(userId: string, userPwd: string): Promise<string> {
  const TWFID = await getTWFID()
  const [publicKey, crsf] = await getPswConf(TWFID)
  return new Promise((resolve) => {
    const RSA = new RSAKey()
    RSA.setPublic(publicKey, '10001')
    const req = request(
      {
        method: 'POST',
        hostname: 'webvpn.cuit.edu.cn',
        port: null,
        path: '/por/login_psw.csp?anti_replay=1&encrypt=1&apiversion=1',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: TWFID
        }
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const $ = load(Buffer.concat(chunks).toString())
          resolve($('Result').text() === '1' ? `TWFID=${res.headers.twfid}` : '')
        })
      }
    )
    req.write(
      new URLSearchParams({
        svpn_req_randcode: crsf,
        svpn_name: userId,
        svpn_password: RSA.encrypt(`${userPwd}_${crsf}`)
      }).toString()
    )
    req.end()
  })
}
