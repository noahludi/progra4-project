import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { dbConnect } from './db'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}
export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export async function setAuthCookie(token: string) {
  const store = await cookies()
  store.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7d
  })
}

export async function clearAuthCookie() {
  const store = await cookies()
  store.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' })
}

export async function getCurrentUser() {
  const store = await cookies()
  const token = store.get('token')?.value
  if (!token) return null
  try {
    const { uid } = jwt.verify(token, JWT_SECRET) as any
    await dbConnect()
    const u = await User.findById(uid).lean()
    if (!u) return null
    return { id: String(u._id), email: u.email, name: u.name as string | undefined }
  } catch {
    return null
  }
}
