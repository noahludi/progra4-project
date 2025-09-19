'use client'

import { useEffect, useState } from 'react'

export type SessionUser = { id: string; email: string; name?: string }

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : { user: null }))
      .then(d => { if (alive) setUser(d?.user ?? null) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return { user, loading }
}
