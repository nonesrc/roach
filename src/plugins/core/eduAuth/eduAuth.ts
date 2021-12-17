import { get, request, RequestOptions } from 'http'
import ssoAuth from '../ssoAuth/ssoAuth'

// Get eduSystem sessionID
function getSessionID(ssoCookie: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const req = get(
      'http://jwgl-cuit-edu-cn.webvpn.cuit.edu.cn:8118/eams/home.action',
      { headers: { Cookie: ssoCookie } }
    )
    req.on('response', function (res) {
      resolve(
        res.statusCode === 302 && res.headers['set-cookie']
          ? res.headers['set-cookie'][0].split(';')[0].split('=')[1]
          : ''
      )
    })
  })
}

function getTicketURL(ssoCookie: string, sessionID: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const options: RequestOptions = {
      method: 'GET',
      hostname: 'sso-cuit-edu-cn-s.webvpn.cuit.edu.cn',
      port: '8118',
      path: `/authserver/login?service=http%3A%2F%2Fjwgl.cuit.edu.cn%2Feams%2Flogin.action%3Bjsessionid%3D${sessionID}`,
      headers: {
        Cookie: ssoCookie,
      },
    }
    const req = request(options)
    req.on('response', function (res) {
      resolve(
        res.statusCode === 302 &&
          res.headers['location'] &&
          /ticket/gi.test(res.headers['location'])
          ? res.headers['location']
          : ''
      )
    })
    req.end()
  })
}

export default async function eduAuth(
  userID: string,
  userPwd: string
): Promise<string> {
  const ssoCookie = await ssoAuth(userID, userPwd)
  const sessionID = await getSessionID(ssoCookie)
  return new Promise(async (resolve, reject) => {
    const ticketURL = await getTicketURL(ssoCookie, sessionID)
    const cookie = [
      `JSESSIONID=${sessionID};`,
      /TWFID=(.*);/.exec(ssoCookie)![0].trim(),
      `GSESSIONID=${sessionID}`,
    ].join('')
    const req = get(ticketURL, { headers: { Cookie: cookie } })
    req.on('response', function (res) {
      if (
        res.statusCode === 302 &&
        res.headers['location'] &&
        /jwgl-cuit-edu-cn/.test(res.headers['location'])
      ) {
        resolve(cookie)
      } else {
        resolve('')
      }
    })
    req.end
  })
}
