import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import Review from '@/models/Review'
import Link from 'next/link'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/profile')

  await dbConnect()
  const mine = await Review.find({ user: user.id }).sort({ createdAt: -1 }).lean()

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-5">
      <h1 className="text-2xl font-semibold">Tu perfil</h1>

      <div className="rounded border p-4">
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        {user.name && <p><span className="font-semibold">Nombre:</span> {user.name}</p>}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tus reseñas</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-gray-600">Todavía no publicaste reseñas.</p>
        ) : (
          <ul className="grid gap-3">
            {mine.map((r: any) => (
              <li key={String(r._id)} className="border rounded p-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap break-words">{r.content}</div>
                    <div className="text-xs text-gray-500 mt-1">⭐ {r.rating}/5 · libro: {r.bookId}</div>
                  </div>
                  <Link href={`/book/${r.bookId}`} className="text-sm text-blue-600 shrink-0">Ver libro →</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
