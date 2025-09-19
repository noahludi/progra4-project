import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { sign, verify, type Secret, type SignOptions } from 'jsonwebtoken'
import { dbConnect } from './db'
import User from '@/models/User'

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '7d'

// ---------- helpers ----------
export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}
export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export function signToken(payload: object, opts: SignOptions = {}) {
  // Al pasar Secret + SignOptions tipados, TS elige la sobrecarga correcta
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES, ...opts })
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
  store.set('token', '', { httpOnly: true, path: '/', expires: new Date(0) })
}

export async function getCurrentUser() {
  const store = await cookies()
  const token = store.get('token')?.value
  if (!token) return null
  try {
    const payload = verify(token, JWT_SECRET) as any
    await dbConnect()
    const u = await User.findById(payload.uid).lean()
    if (!u) return null
    return { id: String(u._id), email: u.email, name: u.name as string | undefined }
  } catch {
    return null
  }
}
