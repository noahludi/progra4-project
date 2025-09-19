import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema, reviewSchema, voteSchema } from '../src/lib/validation'

describe('validation schemas', () => {
  it('register válido/ inválido', () => {
    const ok = registerSchema.parse({ email: 'a@b.com', password: 'Secret123', name: 'A' })
    expect(ok.email).toBe('a@b.com')

    expect(() => registerSchema.parse({ email: 'mal', password: '123' })).toThrow()
  })

  it('login válido/ inválido', () => {
    const ok = loginSchema.parse({ email: 'a@b.com', password: '123456' })
    expect(ok.email).toBe('a@b.com')

    expect(() => loginSchema.parse({ email: 'a@b.com' })).toThrow()
  })

  it('review válido/ inválido', () => {
    const ok = reviewSchema.parse({ bookId: 'id', title: 't', content: 'c', rating: 5 })
    expect(ok.rating).toBe(5)

    expect(() => reviewSchema.parse({ bookId: 'id', title: 't', content: 'c', rating: 6 }))
      .toThrow()
  })

  it('vote válido/ inválido', () => {
    const ok = voteSchema.parse({ value: 1 })
    expect(ok.value).toBe(1)

    expect(() => voteSchema.parse({ value: 2 })).toThrow()
  })
})
