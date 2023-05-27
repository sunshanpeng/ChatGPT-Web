/*
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-13 18:48:46
 * @LastEditTime: 2023-05-14 17:23:03
 * @LastEditors: 孙善鹏
 * @Reference:
 */
import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { midjourneyRequest } from './midjourney'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { UsageType, login, usageLimit } from './user'
import { isNotEmptyString } from './utils/is'

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    usageLimit(req.user.username, UsageType.GPT3)
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/draw', auth, async (req, res) => {
  try {
    usageLimit(req.user.username, UsageType.MJ)
    const prompt = req.body.prompt?.trim()
    if (prompt) {
      console.log(prompt)
      const data = await midjourneyRequest(prompt)
      data.status = 'Success'
      console.log(data)
      res.send(data)
    }
    else {
      throw new Error('请输入正确的prompt')
    }
  }
  catch (error) {
    res.send({ status: 'Success', errorMessage: error.message, data: null })
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { username, password } = req.body as { username: string
      password: string }
    if (!username || !password)
      throw new Error('用户名密码不能为空')

	 const token =	await login(username, password)

    res.send({ status: 'Success', message: 'Verify successfully', data: token })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
