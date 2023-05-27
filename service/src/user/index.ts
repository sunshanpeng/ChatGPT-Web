import { createConnection } from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { sign } from './jwt'

export enum UsageType {
  GPT3 = 'gpt3',
  GPT4 = 'gpt4',
  MJ = 'mj',
}

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

export async function usageLimit(username: string, usageType: UsageType): Promise<void> {
  const type = usageType.valueOf()

  const [rows] = await (await db).execute(
    'SELECT * FROM t_usage WHERE username = ? and type = ?',
    [username, type],
  )
  const usage = rows[0]
  if (!usage)
    return

  console.log(`username: ${username}, usage: ${usage.usage}`)
  if (usage.usage > usage.limit)
    throw new Error('Error: 账号额度不够，请充值')
}

export async function incrUsage(username: string, usageType: UsageType): Promise<void> {
  let limit = 10000
  if (usageType !== UsageType.GPT3)
    limit = 0

  const type = usageType.valueOf()
  try {
    await (await db).execute(
      'INSERT INTO t_usage (username, type,`limit`,`usage`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `usage` = `usage` + 1',
      [username, type, limit, 0],
    )
  }
  catch (err) {
    console.error(err)
    throw new Error('Error: 账号额度不够，请充值')
  }
}
