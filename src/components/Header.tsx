import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { getCurrentUser } from '@/lib/auth'

export default async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">📚 Book Reviews</Link>

        <Link href="/" className="hover:underline">Buscar</Link>
        <Link href="/favorites" className="hover:underline">Favoritos</Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:underline">Buscar</Link>
          {user ? (
            <>
              <Link href="/profile" className="hover:underline">{user.email}</Link>
              <LogoutButton className="rounded border px-3 py-1" />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded border px-3 py-1">Login</Link>
              <Link href="/register" className="rounded border px-3 py-1">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
