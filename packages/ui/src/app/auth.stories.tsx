import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CheckEmail,
  ForgotPasswordForm,
  LoginForm,
  ResetPasswordForm,
  SignupForm,
} from './auth-forms'

/**
 * docs/15-frontend-spec.md 3.1. Four states each where four exist: default,
 * loading, error, and the screen that follows a submit.
 */
const meta: Meta = {
  title: 'App/Auth',
  parameters: { layout: 'fullscreen' },
}
export default meta

export const SignIn: StoryObj = { render: () => <LoginForm /> }

export const SignInLoading: StoryObj = { render: () => <LoginForm loading /> }

export const SignInRejected: StoryObj = {
  name: 'Sign in, rejected',
  render: () => <LoginForm error="That email and password do not match." />,
}

export const SignInUnconfirmed: StoryObj = {
  name: 'Sign in, email not confirmed',
  render: () => (
    <LoginForm
      notice={
        <p className="mb-4 rounded-lg border border-score-mid/40 bg-score-mid/10 px-3 py-2.5 text-[12px] text-score-mid-ink">
          Confirm your email first. We sent the link when you signed up.
        </p>
      }
    />
  ),
}

export const SignUp: StoryObj = { render: () => <SignupForm /> }

export const SignUpTaken: StoryObj = {
  name: 'Sign up, address in use',
  // Deliberately vague: "already registered" tells anyone who asks which
  // addresses have accounts here.
  render: () => <SignupForm error="We could not create that account. Try signing in instead." />,
}

export const Forgot: StoryObj = { render: () => <ForgotPasswordForm /> }

export const Reset: StoryObj = { render: () => <ResetPasswordForm /> }

export const ResetExpired: StoryObj = {
  name: 'Reset, link expired',
  render: () => <ResetPasswordForm error="That link has expired. Ask for a new one." />,
}

export const Confirm: StoryObj = {
  render: () => (
    <CheckEmail
      description={
        <>
          We sent a confirmation link to <strong className="text-tx">amir@northwind.agency</strong>.
        </>
      }
      onResend={() => {}}
    />
  ),
}
