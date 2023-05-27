import * as console from 'console'
import jwt from 'jsonwebtoken'

const secret = 'apeng' // replace with your own secret key

const options = {
  expiresIn: '1h', // token will expire in 1 hour (you can set this to whatever you want)
}

export function sign(username: string): string {
  const token: string = jwt.sign({
    username,
  }, secret, options)
  console.log(token)
  return token
}

export function verify(token: string): any {
  try {
    return jwt.verify(token, secret)
  }
  catch (err) {
    console.log(err)
    throw new Error('Error: token 校验失败 | No access rights')
  }
}
