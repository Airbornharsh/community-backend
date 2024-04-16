import jwt from 'jsonwebtoken'

export const encode = (data: any) => {
  const JWT_SECRET = process.env.JWT_SECRET!
  try {
    const token = jwt.sign(data, JWT_SECRET.trim())
    return token
  } catch (e) {
    return ''
  }
}

export const decode = (token: string) => {
  const JWT_SECRET = process.env.JWT_SECRET!
  try {
    const data = jwt.verify(token, JWT_SECRET)
    return data
  } catch (e) {
    return null
  }
}
