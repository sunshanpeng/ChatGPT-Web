import { createConnection } from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { sign } from './jwt'

const db = createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'chatgpt',
})

export async function login(username: string, password: string): Promise<string> {
  const [rows] = await (await db).execute(
    'SELECT * FROM t_user WHERE username = ?',
    [username],
  )
  const user = rows[0]
  if (!user) {
    // 用户不存在，走注册流程
    const hashedPassword = bcrypt.hashSync(password, 10)
    try {
      // insert user into database
      await (await db).execute(
        'INSERT INTO t_user (username, password) VALUES (?, ?)',
        [username, hashedPassword],
      )
    }
    catch (err) {
      console.error(err)
      throw new Error('Error: 账号不存在，注册失败 | Registration failed')
    }
  }
  else {
    // 用户存在，走登录流程
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      throw new Error('Error: 账号密码错误 | No access rights')
  }
  const token = sign(username)
  return Promise.resolve(token)
}
