'use client'

import { useState } from 'react'
import { ResetPasswordForm } from '@tw/ui'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)

  return (
    <ResetPasswordForm
      loading={loading}
      onSubmit={() => {
        setLoading(true)
        setTimeout(() => window.location.assign('/overview'), 600)
      }}
    />
  )
}
