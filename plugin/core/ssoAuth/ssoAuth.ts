import { get, request, RequestOptions } from 'http'
import easyAuth from '../easyAuth/easyAuth'
import { createWorker, OEM } from 'tesseract.js'
import sharp from 'sharp'

const worker = createWorker({
  logger: m => console.log(m),
})

function getCookie(easyCookie: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = get(
      'http://sso-cuit-edu-cn-s.webvpn.cuit.edu.cn:8118/authserver/login',
      {
        headers: { Cookie: easyCookie },
      },
      function (res) {
        const chunks: Buffer[] = []
        res.on('data', chunk => chunks.push(chunk))
        res.on('end', async function () {
          if (res.statusCode === 200 && res.headers['set-cookie']) {
            resolve(
              res.headers['set-cookie']
                .map(c => c.split(';')[0])
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
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    tessedit_ocr_engine_mode: OEM.TESSERACT_LSTM_COMBINED,
    tessjs_create_hocr: '0',
  })
  return new Promise((resolve, reject) => {
    get(
      'http://sso-cuit-edu-cn-s.webvpn.cuit.edu.cn:8118/authserver/captcha',
      { headers: { Cookie: cookie } },
      function (res) {
        const chunks: Buffer[] = []
        res.on('data', chunk => chunks.push(chunk))
        res.on('end', async function () {
          const pixels = await sharp(Buffer.concat(chunks)).raw().toBuffer()
          for (var i = 0; i < pixels.length; i += 3) {
            var noise = pixels[i] + pixels[i + 1] + pixels[i + 2] <= 90
            if (noise) {
              pixels[i] = 255
              pixels[i + 1] = 255
              pixels[i + 2] = 255
            }
          }
          const imgBuffers = await sharp(pixels, {
            raw: { height: 38, width: 82, channels: 3 },
          })
            .resize(164, 38)
            .threshold(230)
            .sharpen()
            .toFormat('jpeg')
            .toBuffer()
          const {
            data: { text },
          } = await worker.recognize(imgBuffers)
          resolve(codeCover(text))
        })
      }
    )
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
      Cookie: cookie,
    },
  }
  const tryGetCaptchaCode = async function () {
    let captchaCode = ''
    while (true) {
      captchaCode = await getCaptchaCode(cookie)
      if (captchaCode.length === 4) break
    }
    return captchaCode
  }

  const tryGetFinallCookie = function (): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const captcha = await tryGetCaptchaCode()
      const req = request(loginReqOptions, function (res) {
        const chunks: Buffer[] = []
        res.on('data', chunk => chunks.push(chunk))
        res.on('end', async function () {
          resolve(
            res.statusCode === 200 && res.headers['set-cookie']
              ? res.headers['set-cookie'][0].split(';')[0]
              : ''
          )
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
          captcha,
        }).toString()
      )
      req.end()
    })
  }

  // Sending login request
  while (!finalCookie) {
    finalCookie = await tryGetFinallCookie()
    exeCount++
  }
  return [cookie, finalCookie].join(';')
}
