import {TextField} from '../ui/TextField'
import {Button} from '../ui/Button'

interface LoginFormProps{
    email: string
    password: string
    emailError?: string
    passwordError?: string
    generalError?: string | null
    isLoading: boolean
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function LoginForm({
    email,
    password,
    emailError,
    passwordError,
    generalError,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
  }: LoginFormProps) {
    return (
      <form className="space-y-4" onSubmit={onSubmit}>
        {generalError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {generalError}
          </div>
        )}
  
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
          autoComplete="current-password"
          required
          placeholder="Your password"
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
          Sign in
        </Button>
      </form>
    )
  }