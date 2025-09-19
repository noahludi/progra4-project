import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { dbConnect } from '@/lib/db'
import Review from '@/models/Review'
import { reviewSchema } from '@/lib/validation'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

// PATCH /api/reviews/[id]
export async function PATCH(req: NextRequest, ctx: any) {
  const raw = ctx?.params?.id as string | string[] | undefined
  const id = Array.isArray(raw) ? raw[0] : raw
  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await dbConnect()
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body must be valid JSON' }, { status: 400 })
  }

  const data = reviewSchema.pick({ title: true, content: true, rating: true }).partial().parse(body)

  const r = await Review.findById(id)
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (String(r.user) !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  Object.assign(r, data)
  await r.save()
  return NextResponse.json({ ok: true })
}

// DELETE /api/reviews/[id]
export async function DELETE(_req: NextRequest, ctx: any) {
  const raw = ctx?.params?.id as string | string[] | undefined
  const id = Array.isArray(raw) ? raw[0] : raw
  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await dbConnect()
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const r = await Review.findById(id)
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (String(r.user) !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await r.deleteOne()
  return NextResponse.json({ ok: true })
}
