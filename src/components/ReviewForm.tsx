'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import StarRating from './StarRating'

type ReviewInput = {
  title: string
  content: string
  rating: number
}

export default function ReviewForm({
  bookId,
  initial,
  mode = 'create',
  onSaved,
}: {
  bookId: string
  initial?: Partial<ReviewInput>
  mode?: 'create' | 'edit'
  onSaved?: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [rating, setRating] = useState(initial?.rating ?? 5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload: ReviewInput = { title: title.trim(), content: content.trim(), rating }
      const url = mode === 'create' ? '/api/reviews' : `/api/reviews/${(initial as any)?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const body = mode === 'create' ? { ...payload, bookId } : payload

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'No se pudo guardar la reseña')
      }

      setTitle('')
      setContent('')
      setRating(5)
      onSaved?.()
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded border p-4 bg-white/5">
      <div className="space-y-1">
        <label className="text-sm">Título</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Contenido</label>
        <textarea
          className="w-full rounded border px-3 py-2 min-h-[120px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Puntuación</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Guardando…' : (mode === 'create' ? 'Publicar reseña' : 'Guardar cambios')}
      </button>
    </form>
  )
}
