'use client'

import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../components/banner'
import { Button } from '../components/button'
import { Input } from '../components/input'
import { Checkbox } from '../components/toggle'
import { AuthCard, AuthLink } from './auth-card'

/**
 * The five auth screens. docs/15-frontend-spec.md 3.1.
 *
 * All of them are UI only until B1: onSubmit is the caller's, and in F2 the
 * caller is a mock. Two rules hold across every one of them.
 *
 * We never reveal whether an address has an account. Forgot password says the
 * same sentence either way, and a wrong password and an unknown address get the
 * same message. Anything else is an account enumeration endpoint with a
 * friendly face.
 *
 * Passwords are at least ten characters and nothing else. Composition rules
 * push people towards Password1! and away from a passphrase, and we check
 * against known breaches in B1, which is the rule that actually works.
 */

export interface AuthFormProps {
  onSubmit?: (values: Record<string, string>) => void
  loading?: boolean
  error?: string
  /** Rendered above the fields, for "your email is not confirmed yet". */
  notice?: React.ReactNode
}

const MIN_PASSWORD = 10

export function LoginForm({ onSubmit, loading, error, notice }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <AuthCard
      title="Sign in"
      description="Your leads, your audits, your branding."
      footer={
        <>
          No account yet? <AuthLink href="/signup">Create one</AuthLink>
        </>
      }
    >
      {notice}
      {error && <Banner tone="danger" title={error} className="mb-4" />}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.({ email, password })
        }}
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@agency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aside={<AuthLink href="/forgot-password">Forgot?</AuthLink>}
        />
        <Button type="submit" full size="lg" loading={loading} className="mt-1">
          Sign in
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] text-tx2">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        type="button"
        variant="secondary"
        full
        onClick={() => onSubmit?.({ email, magic: 'true' })}
      >
        Email me a magic link
      </Button>
    </AuthCard>
  )
}

export function SignupForm({ onSubmit, loading, error }: AuthFormProps) {
  const [agency, setAgency] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [touched, setTouched] = useState(false)

  const short = password.length > 0 && password.length < MIN_PASSWORD

  return (
    <AuthCard
      title="Create your account"
      description="Free while you try it. No card."
      footer={
        <>
          Already have one? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      {error && <Banner tone="danger" title={error} className="mb-4" />}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTouched(true)
          if (!terms || short || password.length === 0) return
          onSubmit?.({ agency, email, password })
        }}
      >
        <Input
          label="Agency name"
          placeholder="Northwind Digital"
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
          hint="Shown on every report your visitors see."
          required
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@agency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={short ? `At least ${MIN_PASSWORD} characters.` : undefined}
          hint={short ? undefined : `At least ${MIN_PASSWORD} characters. Nothing else.`}
          required
        />

        <div className="mb-4">
          <Checkbox
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            label={
              <span>
                I agree to the <AuthLink href="/legal/terms">Terms</AuthLink> and the{' '}
                <AuthLink href="/legal/privacy">Privacy policy</AuthLink>.
              </span>
            }
          />
          {touched && !terms && (
            <p className="mt-1.5 text-xs text-coral" role="alert">
              Please agree before we create the account.
            </p>
          )}
        </div>

        <Button type="submit" full size="lg" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}

export function ForgotPasswordForm({ onSubmit, loading }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <CheckEmail
        title="Check your email"
        description={
          <>
            If there is an account for <strong className="text-tx">{email}</strong>, a reset link is
            on its way. It is good for one hour.
          </>
        }
      />
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      description="We will email you a link."
      footer={<AuthLink href="/login">Back to sign in</AuthLink>}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.({ email })
          // The same screen follows whether or not the address exists. Saying
          // "no account with that email" would be a lookup tool.
          setSent(true)
        }}
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@agency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" full size="lg" loading={loading}>
          Send the link
        </Button>
      </form>
    </AuthCard>
  )
}

export function ResetPasswordForm({ onSubmit, loading, error }: AuthFormProps) {
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')

  const short = password.length > 0 && password.length < MIN_PASSWORD
  const mismatch = again.length > 0 && again !== password

  return (
    <AuthCard title="Choose a new password">
      {error && <Banner tone="danger" title={error} className="mb-4" />}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (short || mismatch || password.length === 0) return
          onSubmit?.({ password })
        }}
      >
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={short ? `At least ${MIN_PASSWORD} characters.` : undefined}
          required
        />
        <Input
          label="Again"
          type="password"
          autoComplete="new-password"
          value={again}
          onChange={(e) => setAgain(e.target.value)}
          error={mismatch ? 'These two do not match.' : undefined}
          required
        />
        <Button type="submit" full size="lg" loading={loading}>
          Save and sign in
        </Button>
      </form>
    </AuthCard>
  )
}

export function CheckEmail({
  title = 'Check your email',
  description,
  onResend,
  resent,
}: {
  title?: string
  description: React.ReactNode
  onResend?: () => void
  resent?: boolean
}) {
  return (
    <AuthCard title={title} description={description}>
      <div className="flex justify-center py-2">
        <span className="grid size-14 place-items-center rounded-full bg-lime/12 text-lime">
          <MailCheck className="size-6" aria-hidden />
        </span>
      </div>
      {onResend && (
        <Button variant="secondary" full onClick={onResend} disabled={resent} className="mt-4">
          {resent ? 'Sent again' : 'Send it again'}
        </Button>
      )}
      <p className="mt-4 text-center text-[12px] text-tx2">
        Nothing after a minute? Look in spam, then <AuthLink href="/login">try again</AuthLink>.
      </p>
    </AuthCard>
  )
}
