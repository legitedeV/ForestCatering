'use client'

import { useState } from 'react'

type AccessFormProps = {
  returnTo: string
}

export default function AccessForm({ returnTo }: AccessFormProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(false)

    const res = await fetch('/api/prelaunch-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      window.location.href = returnTo
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="space-y-4 p-8 bg-neutral-900 rounded-xl w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Strona prywatna</h1>

        <input
          type="password"
          placeholder="Hasło dostępu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 w-full text-black rounded"
        />

        <button type="submit" className="bg-white text-black px-4 py-2 rounded w-full">
          Wejdź
        </button>

        {error && <p className="text-red-500">Nieprawidłowe hasło</p>}
      </form>
    </div>
  )
}
