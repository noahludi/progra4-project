import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import Favorite from '@/models/Favorite'

type Book = { id: string; title: string; authors: string[]; thumbnail?: string }

async function getBooksForFavorites(bookIds: string[]): Promise<Book[]> {
  // Trae metadata de Google Books por ID
  return Promise.all(
    bookIds.map(async (id) => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`,
          { next: { revalidate: 60 } }
        )
        const j = await res.json()
        const info = j?.volumeInfo ?? {}
        const thumb: string | undefined =
          info?.imageLinks?.thumbnail?.replace('http://', 'https://')
        return {
          id,
          title: info?.title ?? '(Sin título)',
          authors: Array.isArray(info?.authors) ? info.authors : [],
          thumbnail: thumb,
        }
      } catch {
        return { id, title: id, authors: [], thumbnail: undefined }
      }
    })
  )
}

export default async function FavoritesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/favorites')

  await dbConnect()
  const favs = await Favorite.find({ user: user.id }).lean()
  const bookIds = favs.map((f: any) => String(f.bookId))
  const books = await getBooksForFavorites(bookIds)

  return (
    <main className="mx-auto max-w-2xl p-5 space-y-5">
      <h1 className="text-2xl font-semibold">Mis favoritos</h1>

      {books.length === 0 && (
        <p className="text-sm text-gray-600">
          Todavía no tenés favoritos. Volvé al{' '}
          <Link href="/" className="text-blue-600 underline">inicio</Link> y agregá algunos ♥.
        </p>
      )}

      <ul className="grid gap-3 w-full overflow-x-hidden">
        {books.map((b) => (
          <li key={b.id} className="w-full overflow-hidden border rounded-lg p-3 flex items-start gap-3">
            {b.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.thumbnail} alt={`Portada de ${b.title}`} className="w-16 h-24 object-cover rounded shrink-0" />
            ) : (
              <div className="w-16 h-24 rounded bg-gray-100 grid place-items-center text-xs text-gray-500 shrink-0">
                Sin imagen
              </div>
            )}
            <div className="flex-1 min-w-0 break-words">
              <h2 className="font-medium truncate">{b.title}</h2>
              {b.authors?.length > 0 && (
                <p className="text-sm text-gray-600 truncate">{b.authors.join(', ')}</p>
              )}
              <div className="mt-1 flex items-center gap-3">
                <Link href={`/book/${b.id}`} className="text-sm text-blue-600 inline-block max-w-full truncate">
                  Ver detalles →
                </Link>
                <RemoveFavoriteButton bookId={b.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

// Import tardío para evitar edge cases de orden de import
import RemoveFavoriteButton from '@/components/RemoveFavoriteButton'
