'use client'

import { useState } from 'react'
import { LoginForm } from '@tw/ui'

/**
 * UI only until B1. The mock refuses one address on purpose, so the error state
 * is reachable from the browser without editing code: sign in as
 * locked@example.com.
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  return (
    <LoginForm
      loading={loading}
      error={error}
      onSubmit={(values) => {
        setError(undefined)
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          // One message for a wrong password and for an address with no
          // account. Anything more specific is an enumeration endpoint.
          if (values.email?.startsWith('locked@')) {
            setError('That email and password do not match.')
            return
          }
          window.location.assign('/overview')
        }, 600)
      }}
    />
  )
}
