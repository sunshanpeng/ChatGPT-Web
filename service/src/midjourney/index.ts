/*
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 08:51:57
 * @LastEditTime: 2023-05-14 09:38:17
 * @LastEditors: 孙善鹏
 * @Reference:
 */
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

dotenv.config()
const token = process.env.MJ_API_TOKEN

async function midjourneyRequest(prompt: string) {
  const options = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
    }),
  }

  try {
    const response = await fetch(`https://api.zhishuyun.com/midjourney/imagine?token=${token}`, options)
    const json = await response.json()
    console.log(json)
  }
  catch (err) {
    console.error(err)
  }
}

midjourneyRequest('A young and beautiful Chinese female domestic worker, green short-sleeved, youthful, smiling, thumbs up right hand, clean and simple background, V5')
