import { get, request, RequestOptions } from 'http'
import { createWorker, OEM } from 'tesseract.js'
import sharp from 'sharp'
import easyAuth from '../easyAuth/easyAuth'

const worker = createWorker({
  // eslint-disable-next-line
  logger: (m) => console.log(m)
})

function getCookie(easyCookie: string): Promise<string> {
  return new Promise((resolve) => {
    get(
      'http://sso-cuit-edu-cn-s.webvpn.cuit.edu.cn:8118/authserver/login',
      {
        headers: { Cookie: easyCookie }
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', async () => {
          if (res.statusCode === 200 && res.headers['set-cookie']) {
            resolve(
              res.headers['set-cookie']
                .map((c) => c.split(';')[0])
                .concat(easyCookie)
                .join(';')
            )
          } else {
            resolve('')
          }
        })
      }
    )
  })
}

async function getCaptchaCode(cookie: string): Promise<string> {
  const codeCover = (code: string) =>
    code
      .replace(/[\r\n]/g, '')
      .replace(/\s+/g, '')
      .slice(0, 4)

  await (await worker).loadLanguage('eng')
  await (await worker).initialize('eng')
  await (
    await worker
  ).setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    tessedit_ocr_engine_mode: OEM.TESSERACT_LSTM_COMBINED,
    tessjs_create_hocr: '0'
  })
  return new Promise((resolve) => {
    get('http://sso-cuit-edu-cn-s.webvpn.cuit.edu.cn:8118/authserver/captcha', { headers: { Cookie: cookie } }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', async () => {
        const pixels = await sharp(Buffer.concat(chunks)).raw().toBuffer()
        for (let i = 0; i < pixels.length; i += 3) {
          const noise = pixels[i] + pixels[i + 1] + pixels[i + 2] <= 90
          if (noise) {
            pixels[i] = 255
            pixels[i + 1] = 255
            pixels[i + 2] = 255
          }
        }
        const imgBuffers = await sharp(pixels, {
          raw: { height: 38, width: 82, channels: 3 }
        })
          .resize(164, 38)
          .threshold(230)
          .sharpen()
          .toFormat('jpeg')
          .toBuffer()
        const {
          data: { text }
        } = await (await worker).recognize(imgBuffers)
        resolve(codeCover(text))
      })
    })
  })
}

export default async function ssoAuth(userId: string, userPwd: string) {
  let exeCount = 1
  let finalCookie = ''
  const easyCookie = await easyAuth(userId, userPwd)
  if (!easyCookie) Promise.resolve('')
  const cookie = await getCookie(easyCookie)
  const loginReqOptions: RequestOptions = {
    method: 'POST',
    hostname: 'sso-cuit-edu-cn-s.webvpn.cuit.edu.cn',
    port: '8118',
    path: '/authserver/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookie
    }
  }

  async function tryGetCaptchaCode() {
    let captchaCode = ''
    /* eslint-disable no-await-in-loop */
    while (true) {
      captchaCode = await getCaptchaCode(cookie)
      if (captchaCode.length === 4) break
    }
    /* eslint-disable no-await-in-loop */
    return captchaCode
  }

  async function tryGetFinallCookie(): Promise<string> {
    const captcha = await tryGetCaptchaCode()
    return new Promise((resolve) => {
      const req = request(loginReqOptions, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          resolve(res.statusCode === 200 && res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '')
        })
      })
      req.write(
        new URLSearchParams({
          execution: `e1s${exeCount}`,
          _eventId: 'submit',
          lm: 'usernameLogin',
          geolocation: '',
          username: userId,
          password: userPwd,
          captcha
        }).toString()
      )
      req.end()
    })
  }

  /* eslint-disable no-await-in-loop */
  while (!finalCookie) {
    finalCookie = await tryGetFinallCookie()
    exeCount += 1
  }
  /* eslint-disable no-await-in-loop */
  return [cookie, finalCookie].join(';')
}
