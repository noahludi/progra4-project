import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { sign, verify, type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken'
import { dbConnect } from './db'
import User from '@/models/User'

/**
 * Tipos compatibles con jsonwebtoken v9.
 * No hacemos throws en import-time para no romper tests/build.
 */
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
    const u = await User.findById(payload.uid).lean()
    if (!u) return null

    return { id: String(u._id), email: u.email, name: (u as any).name as string | undefined }
  } catch {
    return null
  }
}
