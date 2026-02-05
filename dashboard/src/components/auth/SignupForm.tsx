// dashboard/src/components/auth/SignupForm.tsx
import { TextField } from '../ui/TextField'
import { Button } from '../ui/Button'

interface SignupFormProps {
  email: string
  password: string
  username: string
  passwordConfirm: string
  emailError?: string
  passwordError?: string
  usernameError?: string
  passwordConfirmError?: string
  generalError?: string | null
  isLoading: boolean
  isDirty: boolean
  showPassword: boolean
  showPasswordConfirm: boolean
  onReset: () => void
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordConfirmChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearEmail: () => void
  onClearUsername: () => void
  onClearPassword: () => void
  onClearPasswordConfirm: () => void
  onTogglePassword: () => void
  onTogglePasswordConfirm: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function SignupForm({
  email,
  password,
  username,
  emailError,
  passwordError,
  passwordConfirm,
  usernameError,
  passwordConfirmError,
  isLoading,
  isDirty,
  showPassword,
  showPasswordConfirm,
  onReset,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onPasswordConfirmChange,
  onClearEmail,
  onClearUsername,
  onClearPassword,
  onClearPasswordConfirm,
  onTogglePassword,
  onTogglePasswordConfirm,
  onSubmit,
}: SignupFormProps) {
  return (
    <form noValidate className="space-y-4" onSubmit={onSubmit}>
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
        onClear={onClearUsername}
      />

      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={onEmailChange}
        error={emailError}
        onClear={onClearEmail}
      />

<TextField
  label="Password"
  name="password"
  type={showPassword ? 'text' : 'password'}
  autoComplete="new-password"
  required
  placeholder="Minimum 8 characters"
  value={password}
  onChange={onPasswordChange}
  error={passwordError}
  showPasswordToggle
  isPasswordVisible={showPassword}
  onTogglePassword={onTogglePassword}
/>

<TextField
  label="Confirm Password"
  name="passwordConfirm"
  type={showPasswordConfirm ? 'text' : 'password'}
  autoComplete="new-password"
  required
  placeholder="Re-enter your password"
  value={passwordConfirm}
  onChange={onPasswordConfirmChange}
  error={passwordConfirmError}
  showPasswordToggle
  isPasswordVisible={showPasswordConfirm}
  onTogglePassword={onTogglePasswordConfirm}
/>

<div className="flex gap-3 mt-6">
  <Button
  type="button"
  variant="ghost"
  className="flex-1"
  disabled={!isDirty}
  onClick={onReset}
>
  Reset
</Button>
  <Button
    type="submit"
    variant="primary"
    className="flex-1"
    isLoading={isLoading}
  >
    {isLoading ? 'Signing up...' : 'Sign up'}
  </Button>
</div>
    </form>
  )
}