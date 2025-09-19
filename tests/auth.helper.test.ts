import { describe, it, expect, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'

let auth: typeof import('../src/lib/auth')

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_EXPIRES = '1d'
  // 👇 dummy para que db.ts no explote al import
  process.env.MONGODB_URI = 'mongodb://localhost:27017/_dummy'

  auth = await import('../src/lib/auth')
})

describe('auth helpers', () => {
  it('hash/compare funciona', async () => {
    const h = await auth.hashPassword('Secret123')
    expect(h).not.toBe('Secret123')
    expect(await auth.comparePassword('Secret123', h)).toBe(true)
    expect(await auth.comparePassword('otra', h)).toBe(false)
  })

  it('JWT sign/verify funciona', () => {
    const t = auth.signToken({ uid: 'u1' })
    const d = jwt.verify(t, process.env.JWT_SECRET!)
    // @ts-ignore
    expect(d.uid).toBe('u1')
  })
})
