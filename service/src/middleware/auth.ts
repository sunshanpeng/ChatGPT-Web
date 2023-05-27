import { verify } from '../user/jwt'

const auth = async (req, res, next) => {
  try {
    const Authorization = req.header('Authorization')
    if (!Authorization)
      throw new Error('Error: 无访问权限 | No access rights')
    const token = Authorization.replace('Bearer ', '').trim()
    const { username } = verify(token)
    req.user = { username }
    next()
  }
  catch (error) {
    res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
  }
}

export { auth }
