/*
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-13 18:48:46
 * @LastEditTime: 2023-05-31 20:53:51
 * @LastEditors: 孙善鹏
 * @Reference:
 */
import express from 'express'
import multer from 'multer'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, chatRequest, currentModel } from './chatgpt'
import { midjourneyRequest } from './midjourney'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { UsageType, incrUsage, login, promptRecord, usageLimit } from './user'
import { isNotEmptyString } from './utils/is'
import { optimizePropmt } from './midjourney/types'
import { uploadToOss } from './utils/oss'

const app = express()
const router = express.Router()
const storage = multer.diskStorage({
  // destination(req, file, cb) {
  //   cb(null, 'uploads/') // 指定文件的保存目录
  // },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`) // 给上传的文件重命名，避免重名
  },
})
const upload = multer({ storage })

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
  res.setHeader('Transfer-Encoding', 'chunked')
  try {
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
    await promptRecord(req.user.username, UsageType.GPT3, prompt)
    await incrUsage(req.user.username, UsageType.GPT3)
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
router.post('/mjOptimize', auth, async (req, res) => {
  res.setHeader('Content-type', 'application/json')
  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    if (!prompt)
      throw new Error('{ type: \'Fail\', message: \'请输入正确的prompt\' }')
    const startTime = new Date().getTime()
    const response = await chatRequest({
      message: optimizePropmt + prompt,
      lastContext: options,
      systemMessage,
      temperature,
      top_p,
    })
    const endTime = new Date().getTime()
    const seconds = (endTime - startTime) / 1000
    await promptRecord(req.user.username, UsageType.GPT3, prompt, seconds, JSON.stringify(response))
    await incrUsage(req.user.username, UsageType.GPT3)
    res.send(response)
  }
  catch (error) {
    res.write(JSON.stringify(error.message || error))
  }
  finally {
    res.end()
  }
})

router.post('/draw', auth, async (req, res) => {
  try {
    await usageLimit(req.user.username, UsageType.MJ)
    const prompt = req.body.prompt?.trim()
    if (prompt) {
      const startTime = new Date().getTime()
      const data = await midjourneyRequest(prompt)
      const endTime = new Date().getTime()
      const seconds = (endTime - startTime) / 1000
      await promptRecord(req.user.username, UsageType.MJ, prompt, seconds, JSON.stringify(data))
      if (!data.image_url)
        throw new Error(`画作生成失败:${data.detail}`)

      await incrUsage(req.user.username, UsageType.MJ)
      data.status = 'Success'
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

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileUrl = await uploadToOss(req.file)
    res.send(fileUrl)
  }
  catch (err) {
    console.log(err)
    res.status(500).send('Error uploading file!')
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
