/*
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 09:27:07
 * @LastEditTime: 2023-05-14 10:40:09
 * @LastEditors: 孙善鹏
 * @Reference:
{
  task_id: 'dacbfc72-9956-4649-b2b7-45d6e34360df',
  image_id: '1107134925129388072',
  image_url: 'https://midjourney.cdn.zhishuyun.com/attachments/1104771956944949271/1107134925129388072/v5Xywfd3_ignoredacbfc72-9956-4649-b2b7-45d6e34360df_A_young_and_329606ce-af5c-4171-9840-87f9f484dede.png',
  actions: [
    'upsample1',
    'upsample2',
    'upsample3',
    'upsample4',
    'variation1',
    'variation2',
    'variation3',
    'variation4'
  ]
}
 */
export interface MidjourneyResponse {
  task_id: string
  image_id: string
  image_url: string
  actions: []
}
