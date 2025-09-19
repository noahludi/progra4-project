'use client'

import { useSession } from '@/lib/useSession'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'

export default function BookReviews({ bookId }: { bookId: string }) {
  const { user, loading } = useSession()

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Reseñas</h2>

      {!loading && !user && (
        <p className="text-sm text-gray-600">
          Tenés que <a href={`/login?next=${encodeURIComponent(`/book/${bookId}`)}`} className="text-blue-600">iniciar sesión</a> para escribir o votar reseñas.
        </p>
      )}

      {user && (
        <ReviewForm bookId={bookId} onSaved={() => { /* ReviewList se actualiza al refresh */ }} />
      )}

      <ReviewList bookId={bookId} />
    </section>
  )
}
