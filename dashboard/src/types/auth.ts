export interface SignupFormProps {
    email: string;
    password: string;
    username: string;
    passwordConfirm: string;
    emailError?: string;
    passwordError?: string;
    usernameError?: string;
    passwordConfirmError?: string;
    generalError?: string | null;
    isLoading: boolean;
    isDirty: boolean;
    showPassword: boolean;
    showPasswordConfirm: boolean;
    onReset: () => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordConfirmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearEmail: () => void;
    onClearUsername: () => void;
    onClearPassword: () => void;
    onClearPasswordConfirm: () => void;
    onTogglePassword: () => void;
    onTogglePasswordConfirm: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface LoginFormProps {
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