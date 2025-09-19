'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const doLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={doLogout} disabled={loading} className={className ?? 'px-3 py-2 rounded bg-gray-800 text-white'}>
      {loading ? 'Saliendo…' : 'Cerrar sesión'}
    </button>
  )
}
