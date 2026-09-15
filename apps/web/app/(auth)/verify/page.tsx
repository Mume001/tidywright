'use client'

import { useState } from 'react'
import { CheckEmail } from '@tw/ui'

/** Where signup lands somebody who closed the tab and came back. */
export default function VerifyPage() {
  const [resent, setResent] = useState(false)

  return (
    <CheckEmail
      title="Confirm your email"
      description="We need to know the address works before we send reports from it."
      onResend={() => setResent(true)}
      resent={resent}
    />
  )
}
