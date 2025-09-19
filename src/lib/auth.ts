import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { sign, verify, type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken'
import { Types } from 'mongoose'
import { dbConnect } from './db'
import User from '@/models/User'

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? '') as Secret
const JWT_EXPIRES = (process.env.JWT_EXPIRES ?? '7d') as unknown as SignOptions['expiresIn']

// ---------- helpers de password ----------
export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}
export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

// ---------- JWT ----------
export function signToken(payload: object, opts?: SignOptions): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES, ...(opts ?? {}) }
  return sign(payload, JWT_SECRET, options)
}

// ---------- cookies de sesión ----------
export async function setAuthCookie(token: string) {
  const store = await cookies()
  store.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })
}

export async function clearAuthCookie() {
  const store = await cookies()
  store.set('token', '', { httpOnly: true, path: '/', expires: new Date(0) })
}

// ---------- sesión actual ----------
export async function getCurrentUser() {
  const store = await cookies()
  const token = store.get('token')?.value
  if (!token) return null

  try {
    const payload = verify(token, JWT_SECRET) as JwtPayload & { uid?: string }
    if (!payload?.uid) return null

    await dbConnect()

    // Tipamos el resultado de lean para evitar el union raro
    type UserLean = { _id: Types.ObjectId; email: string; name?: string }
    const u = await User.findById(payload.uid)
      .select({ email: 1, name: 1 })
      .lean<UserLean>()

    if (!u) return null

    return { id: u._id.toString(), email: u.email, name: u.name }
  } catch {
    return null
  }
}
