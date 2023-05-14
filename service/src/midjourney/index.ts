/*
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 08:51:57
 * @LastEditTime: 2023-05-14 10:41:00
 * @LastEditors: 孙善鹏
 * @Reference:
 */
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import type { MidjourneyResponse } from './types'

dotenv.config()
const token = process.env.MJ_API_TOKEN

async function midjourneyRequest(prompt: string): Promise<MidjourneyResponse> {
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
    return json as MidjourneyResponse
  }
  catch (err) {
    console.error(err)
    throw err
  }
}

async function main() {
  const response = await midjourneyRequest('A young and beautiful Chinese female nanny holds baby, green short sleeves, smiling, on a light background, --v 5')
  console.log(response.image_url)
}
