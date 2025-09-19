'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '@/lib/useSession'

type Book = {
  id: string
  title: string
  authors: string[]
  thumbnail?: string
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const { user } = useSession()

  const [query, setQuery] = useState(sp.get('q') ?? '')
  const [results, setResults] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // favoritos del usuario
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [busyFav, setBusyFav] = useState<string | null>(null)

  // abortar requests previos
  const abortRef = useRef<AbortController | null>(null)

  // carga inicial si vienen con ?q=
  useEffect(() => {
    const initial = sp.get('q')
    if (initial && initial.trim()) {
      void search(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // solo una vez

  // traer favoritos si hay sesión
  useEffect(() => {
    if (!user) {
      setFavs(new Set())
      return
    }
    fetch('/api/favorites', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { items: [] })
      .then(d => setFavs(new Set((d.items ?? []).map((x: any) => x.bookId))))
      .catch(() => setFavs(new Set()))
  }, [user])

  async function search(qParam?: string) {
    const q = (qParam ?? query).trim()
    if (!q) return
    setIsLoading(true)
    setError(null)

    // sincronizo la URL
    router.replace(`${pathname}?q=${encodeURIComponent(q)}`)

    // aborto request anterior
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      if (!res.ok) throw new Error('No se pudo buscar')
      const json = await res.json()
      setResults(Array.isArray(json?.items) ? json.items : [])
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setResults([])
        setError(e?.message ?? 'Error desconocido')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    await search()
  }

  const isFav = (id: string) => favs.has(id)

  async function toggleFav(bookId: string) {
    if (!user) {
      // redirijo a login conservando ruta actual
      router.push(`/login?next=${encodeURIComponent(pathname + '?' + sp.toString())}`)
      return
    }
    setBusyFav(bookId)
    const optimistic = new Set(favs)
    const adding = !optimistic.has(bookId)
    if (adding) optimistic.add(bookId)
    else optimistic.delete(bookId)
    setFavs(optimistic)

    try {
      const method = adding ? 'POST' : 'DELETE'
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar favoritos')
    } catch {
      // rollback
      const rollback = new Set(favs)
      setFavs(rollback)
    } finally {
      setBusyFav(null)
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
          disabled={!query.trim() || isLoading}
          className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-50"
        >
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && results.length === 0 && !error && (
        <p className="text-sm text-gray-600">Ingresá un término y presioná “Buscar”.</p>
      )}

      {isLoading && (
        <ul className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="border rounded-lg p-3 flex items-start gap-3 animate-pulse">
              <div className="w-16 h-24 bg-gray-200 rounded" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </li>
          ))}
        </ul>
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
                <p className="text-sm text-gray-600 truncate">{b.authors.join(', ')}</p>
              )}
              <div className="mt-1 flex items-center gap-3">
                <Link
                  href={`/book/${b.id}`}
                  className="text-sm text-blue-600 inline-block max-w-full truncate"
                >
                  Ver detalles →
                </Link>

                <button
                  type="button"
                  onClick={() => toggleFav(b.id)}
                  disabled={busyFav === b.id}
                  className="text-sm rounded border px-2 py-1"
                  aria-pressed={isFav(b.id)}
                  title={isFav(b.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {isFav(b.id) ? '❤️ Favorito' : '🤍 Favorito'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
