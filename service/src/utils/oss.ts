/*
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-29 22:01:02
 * @LastEditTime: 2023-05-31 20:43:59
 * @LastEditors: 孙善鹏
 * @Reference:
 */
import OSS from 'ali-oss'

// oss-cn-hangzhou.aliyuncs.com
const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: 'mj-img-sun',
})
const headers = {
  // 指定Object的存储类型。
  'x-oss-storage-class': 'Standard',
  // 指定Object的访问权限。
  //   'x-oss-object-acl': 'private',
  // 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称定义为example.jpg。
  // 'Content-Disposition': 'attachment; filename="example.jpg"'
  // 设置Object的标签，可同时设置多个标签。
  //   'x-oss-tagging': 'Tag1=1&Tag2=2',
  // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
  'x-oss-forbid-overwrite': 'true',
}

export async function uploadToOss(file): Promise<string> {
  try {
    const result = await client.put(file.filename, file.path, { headers })
    console.log(result)
    return result.url
  }
  catch (e) {
    console.log(e)
  }
}
