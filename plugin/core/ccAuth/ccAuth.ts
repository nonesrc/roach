import { request, get, IncomingMessage } from 'http'
import cheerio from 'cheerio'

// Request Cookies Data
function authDataPacker(txtId: string, txtMM: string) {
  if (!txtId || !txtMM) throw new Error('Auth data error!')
  return new URLSearchParams({
    WinW: '1280',
    WinH: '761',
    'IbtnEnter.x': '72',
    'IbtnEnter.y': '44',
    Login: 'Check',
    codeKey: '00000',
    txtId,
    txtMM,
  }).toString()
}

// Resolve cookie
function resolveCookie(res: IncomingMessage) {
  return res.headers['set-cookie']
    ? res.headers['set-cookie'][0].split(';')[0]
    : void 0
}

// Step 1: get actived cookie
function getActivedCookie(userName: string, userPwd: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    const httpReq = request({
      host: 'login.cuit.edu.cn',
      path: '/Login/xLogin/Login.asp',
      method: 'POST',
      headers: {
        Referer: 'http://login.cuit.edu.cn/Login/xLogin/Login.asp',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    httpReq.on('response', function (res) {
      const activedCookie = resolveCookie(res)
      if (activedCookie && res.statusCode === 302) {
        resolve(activedCookie)
      } else {
        resolve('')
      }
    })
    httpReq.write(authDataPacker(userName, userPwd))
    httpReq.end()
  })
}

// Step 2: get a blank cookie
function getBlankCookie(): Promise<[string, string]> {
  return new Promise(function (resolve, reject) {
    const httpReq = request(
      {
        host: 'jszx-jxpt.cuit.edu.cn',
        path: '/Jxgl/Login/tyLogin.asp',
        method: 'GET',
      },
      function (res) {
        const chunks: Buffer[] = []
        res.on('data', chunk => chunks.push(chunk))
        res.on('end', function () {
          const html = cheerio.load(Buffer.concat(chunks).toString())
          const cookie = resolveCookie(res)
          const refreshURL = html('meta[http-equiv="refresh"]')
            .attr()
            ['content'].slice(6)
          if (
            /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(
              refreshURL
            ) &&
            cookie
          ) {
            resolve([cookie, refreshURL])
          } else {
            resolve(['', ''])
          }
        })
      }
    )
    httpReq.end()
  })
}

// Step 3: Link actived cookie and blank cookie
export default async function ccAuth(
  userId: string,
  userPwd: string
): Promise<[string, string]> {
  const activedCookie = await getActivedCookie(userId, userPwd)
  const [blankCookie, refreshURL] = await getBlankCookie()
  // Login centre base url
  const loginBaseURL = 'http://jszx-jxpt.cuit.edu.cn/Jxgl/'
  // Final login check url
  const finalCheckURL =
    'http://jszx-jxpt.cuit.edu.cn/Jxgl/UserPub/Login.asp?UTp=Xs&Func=Login'
  // Computing centre header
  const computingCentreHeader = { headers: { Cookie: blankCookie } }
  return new Promise(function (resolve, reject) {
    get(refreshURL, { headers: { Cookie: activedCookie } }, function (res) {
      if (res.statusCode === 302 && res.headers['location']) {
        get(res.headers['location'], computingCentreHeader, function (_res) {
          if (_res.statusCode === 302 && _res.headers['location']) {
            get(
              loginBaseURL + 'Login/' + _res.headers['location'],
              computingCentreHeader,
              function (__res) {
                if (__res.statusCode === 302 && __res.headers['location']) {
                  get(finalCheckURL, computingCentreHeader, function (___res) {
                    if (
                      ___res.statusCode === 302 &&
                      ___res.headers['location'] === '/Jxgl/Xs/MainMenu.asp'
                    ) {
                      resolve([activedCookie, blankCookie])
                    } else {
                      reject(
                        'Error at cookie linking(___res): ' +
                          ___res.headers['location']
                      )
                    }
                  })
                } else {
                  reject(
                    'Error at cookie linking(__res): ' +
                      __res.headers['location']
                  )
                }
              }
            )
          } else {
            reject('Error at cookie linking(_res): ' + _res.headers['location'])
          }
        })
      } else {
        reject('Error at cookie linking(res): ' + res.headers['location'])
      }
    })
  })
}
