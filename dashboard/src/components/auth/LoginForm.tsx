// dashboard/src/components/auth/LoginForm.tsx
import {TextField} from '../ui/TextField'
import {Button} from '../ui/Button'

interface LoginFormProps{
    email: string
    password: string
    emailError?: string
    passwordError?: string
    generalError?: string | null
    isLoading: boolean
    isDirty: boolean
    showPassword: boolean
    onReset: () => void
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onClearEmail: () => void
    onClearPassword: () => void
    onTogglePassword: () => void
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function LoginForm({
    email,
    password,
    emailError,
    passwordError,
    isLoading,
    isDirty,
    showPassword,
    onReset,
    onEmailChange,
    onPasswordChange,
    onClearEmail,
    onClearPassword,
    onTogglePassword,
    onSubmit,
  }: LoginFormProps) {
    return (
      <form noValidate className="space-y-4" onSubmit={onSubmit}>
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
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          value={password}
          onChange={onPasswordChange}
          error={passwordError}
          showPasswordToggle
          isPasswordVisible={showPassword}
          onTogglePassword={onTogglePassword}
        />
  
  <div className="flex gap-3 mt-6">
  <Button
  type="button"
  variant="secondary"
  className="flex-1 !bg-gray-600 !text-white !border-gray-600 disabled:!bg-gray-200 disabled:!text-gray-400 disabled:!border-gray-200"
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
    {isLoading ? 'Logging in...' : 'Log in'}
  </Button>
</div>
      </form>
    )
  }