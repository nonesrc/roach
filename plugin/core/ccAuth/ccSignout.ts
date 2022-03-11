import { get } from 'http'

export default function ccSignout(activedCookie: string, blankCookie: string): Promise<boolean> {
  const userPubURL = 'http://jszx-jxpt.cuit.edu.cn/Jxgl/UserPub/Logout.asp?UTp=Xs'
  const unlinkCookieURL = 'http://login.cuit.edu.cn/Login/Logout.asp?from=http%3A%2F%2Fjszx%2Ecuit%2Eedu%2Ecn'
  return new Promise((resolve) => {
    get(userPubURL, { headers: { Cookie: blankCookie } }, (res) => {
      if (res.statusCode === 200) {
        get(unlinkCookieURL, { headers: { Cookie: activedCookie } }, (_res) => {
          resolve(_res.statusCode === 200)
        })
      } else {
        resolve(false)
      }
    })
  })
}
