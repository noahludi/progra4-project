'use client'

import { useEffect, useState } from 'react'

export default function VoteButtons({ reviewId }: { reviewId: string }) {
  const [score, setScore] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      const r = await fetch(`/api/reviews/${reviewId}/votes`, { cache: 'no-store' })
      const j = await r.json()
      setScore(j.score ?? 0)
    } catch { /* noop */ }
  }

  useEffect(() => { load() }, [reviewId])

  async function vote(value: 1 | -1) {
    setLoading(true)
    const prev = score
    setScore(prev + value) // optimista (si cambió de signo queda distinto, simple)
    try {
      const r = await fetch(`/api/reviews/${reviewId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      if (!r.ok) {
        setScore(prev)
        if (r.status === 401) {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
        }
      } else {
        await load()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => vote(1)}
        className="rounded border px-2 py-1 text-sm"
      >+1</button>
      <span className="min-w-6 text-center tabular-nums">{score}</span>
      <button
        type="button"
        disabled={loading}
        onClick={() => vote(-1)}
        className="rounded border px-2 py-1 text-sm"
      >-1</button>
    </div>
  )
}
