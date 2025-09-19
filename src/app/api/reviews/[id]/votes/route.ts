// src/app/api/reviews/[id]/votes/route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { dbConnect } from '@/lib/db'
import Vote from '@/models/Vote'
import { getCurrentUser } from '@/lib/auth'
import { voteSchema } from '@/lib/validation'

export const runtime = 'nodejs'

// GET /api/reviews/[id]/votes -> { up, down, score }
export async function GET(_req: NextRequest, ctx: any) {
  const raw = ctx?.params?.id as string | string[] | undefined
  const id = Array.isArray(raw) ? raw[0] : raw
  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await dbConnect()
  const [up, down] = await Promise.all([
    Vote.countDocuments({ review: id, value: 1 }),
    Vote.countDocuments({ review: id, value: -1 }),
  ])
  return NextResponse.json({ up, down, score: up - down })
}

// POST /api/reviews/[id]/votes -> body { value: 1 | -1 }
export async function POST(req: NextRequest, ctx: any) {
  const raw = ctx?.params?.id as string | string[] | undefined
  const id = Array.isArray(raw) ? raw[0] : raw
  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body must be valid JSON' }, { status: 400 })
  }
  const { value } = voteSchema.parse(body)

  await dbConnect()
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  // upsert del voto del usuario para esa review
  const existing = await Vote.findOne({ review: id, user: user.id })
  if (existing) {
    existing.value = value
    await existing.save()
  } else {
    await Vote.create({ review: id, user: user.id, value })
  }

  const [up, down] = await Promise.all([
    Vote.countDocuments({ review: id, value: 1 }),
    Vote.countDocuments({ review: id, value: -1 }),
  ])
  return NextResponse.json({ up, down, score: up - down })
}
