'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RemoveFavoriteButton({ bookId }: { bookId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const removeFav = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      })
      if (!res.ok) throw new Error('No se pudo quitar de favoritos')
      router.refresh() // recarga la lista del server component
    } catch {
      // opcional: toast de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={removeFav}
      disabled={loading}
      className="text-sm rounded border px-2 py-1 text-red-600 disabled:opacity-50"
      title="Quitar de favoritos"
    >
      {loading ? 'Quitando…' : 'Quitar'}
    </button>
  )
}
