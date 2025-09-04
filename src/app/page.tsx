'use client'
import { useState } from 'react'
import Link from 'next/link'

type Book = {
  id: string
  title: string
  authors: string[]
  thumbnail?: string
}

export default function Page() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    if (!query.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const json = await res.json()
      setResults(Array.isArray(json?.items) ? json.items : [])
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-5 space-y-5">
      <h1 className="text-2xl font-semibold text-center">Buscá libros</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="título, autor, ISBN"
          className="flex-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!query || isLoading}
          className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-50"
        >
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {!isLoading && results.length === 0 && (
        <p className="text-sm text-gray-600">Ingresá un término y presioná “Buscar”.</p>
      )}

      <ul className="grid gap-3 w-full overflow-x-hidden">
        {results.map((b) => (
          <li
            key={b.id}
            className="w-full overflow-hidden border rounded-lg p-3 flex items-start gap-3"
          >
            {b.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.thumbnail}
                alt={`Portada de ${b.title}`}
                className="w-16 h-24 object-cover rounded shrink-0"
              />
            ) : (
              <div className="w-16 h-24 rounded bg-gray-100 grid place-items-center text-xs text-gray-500 shrink-0">
                Sin imagen
              </div>
            )}

            <div className="flex-1 min-w-0 break-words">
              <h2 className="font-medium truncate">{b.title}</h2>
              {b.authors?.length > 0 && (
                <p className="text-sm text-gray-600 truncate">
                  {b.authors.join(', ')}
                </p>
              )}
              <Link
                href={`/book/${b.id}`}
                className="text-sm text-blue-600 inline-block max-w-full truncate"
              >
                Ver detalles →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
