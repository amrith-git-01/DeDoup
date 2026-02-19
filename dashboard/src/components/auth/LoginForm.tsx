// dashboard/src/components/auth/LoginForm.tsx
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import type { LoginFormProps } from '../../types/auth';

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
          variant="ghost"
          className="flex-1"
          disabled={!isDirty}
          onClick={onReset}
        >
          Reset
        </Button>
        <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </div>
    </form>
  );
}
