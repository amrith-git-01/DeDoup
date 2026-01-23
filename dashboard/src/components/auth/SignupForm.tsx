// dashboard/src/components/auth/SignupForm.tsx
import { TextField } from '../ui/TextField'
import { Button } from '../ui/Button'

interface SignupFormProps {
  email: string
  password: string
  username: string
  emailError?: string
  passwordError?: string
  usernameError?: string
  generalError?: string | null
  isLoading: boolean
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

export function SignupForm({
  email,
  password,
  username,
  emailError,
  passwordError,
  usernameError,
  generalError,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onSubmit,
}: SignupFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {generalError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {generalError}
        </div>
      )}

      <TextField
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        required
        placeholder="Choose a username"
        value={username}
        onChange={onUsernameChange}
        error={usernameError}
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={onEmailChange}
        error={emailError}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Minimum 8 characters"
        value={password}
        onChange={onPasswordChange}
        error={passwordError}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        Create account
      </Button>
    </form>
  )
}