'use client'

import { useEffect, useMemo, useState } from 'react'
import VoteButtons from './VoteButtons'
import ReviewForm from './ReviewForm'
import { useSession } from '@/lib/useSession'

type Row = {
  id: string
  user: string
  bookId: string
  title: string
  content: string
  rating: number
  createdAt?: string
}

export default function ReviewList({ bookId }: { bookId: string }) {
  const { user } = useSession()
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const isOwner = (r: Row) => user && r.user === user.id

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/reviews?bookId=${encodeURIComponent(bookId)}`, { cache: 'no-store' })
      const j = await r.json()
      setItems(j.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [bookId])

  async function remove(id: string) {
    const prev = items
    setItems(prev.filter(x => x.id !== id))
    const resp = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    if (!resp.ok) {
      setItems(prev) // rollback
      if (resp.status === 401) window.location.href = `/login?next=${encodeURIComponent(location.pathname)}`
    }
  }

  const editing = useMemo(() => items.find(i => i.id === editingId), [items, editingId])

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-gray-600">Cargando reseñas…</p>}

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-600">No hay reseñas aún.</p>
      )}

      <ul className="space-y-3">
        {items.map(r => (
          <li key={r.id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{r.content}</p>
                <p className="text-xs text-gray-500 mt-1">⭐ {r.rating}/5</p>
              </div>

              <VoteButtons reviewId={r.id} />
            </div>

            {isOwner(r) && (
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded border px-3 py-1 text-sm"
                  onClick={() => setEditingId(r.id)}
                >
                  Editar
                </button>
                <button
                  className="rounded border px-3 py-1 text-sm text-red-600"
                  onClick={() => remove(r.id)}
                >
                  Eliminar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {editing && (
        <div className="rounded border p-4">
          <h4 className="mb-2 font-medium">Editar reseña</h4>
          <ReviewForm
            mode="edit"
            bookId={bookId}
            initial={{ id: editing.id, title: editing.title, content: editing.content, rating: editing.rating } as any}
            onSaved={async () => { setEditingId(null); await load() }}
          />
          <div className="mt-2">
            <button className="text-sm text-gray-600 underline" onClick={() => setEditingId(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
