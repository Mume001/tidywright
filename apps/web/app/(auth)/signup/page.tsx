'use client'

import { useState } from 'react'
import { CheckEmail, SignupForm } from '@tw/ui'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string>()
  const [resent, setResent] = useState(false)

  if (sentTo) {
    return (
      <CheckEmail
        description={
          <>
            We sent a confirmation link to <strong className="text-tx">{sentTo}</strong>. Open it
            and you are in.
          </>
        }
        onResend={() => setResent(true)}
        resent={resent}
      />
    )
  }

  return (
    <SignupForm
      loading={loading}
      onSubmit={(values) => {
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          setSentTo(values.email ?? '')
        }, 600)
      }}
    />
  )
}
