// dashboard/src/pages/AuthPage.tsx
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAppDispatch } from '../store/hooks'
import { setAuth, setLoading, setError } from '../store/slices/authSlice'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'

type AuthTab = 'login' | 'signup'

interface AuthForm {
  email: string
  password: string
  username: string
}

interface FieldErrors {
  email?: string
  password?: string
  username?: string
}

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [form, setForm] = useState<AuthForm>({
    email: '',
    password: '',
    username: '',
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (location.pathname.includes('signup')) {
      setActiveTab('signup')
    } else {
      setActiveTab('login')
    }
    setGeneralError(null)
    setForm({ email: '', password: '', username: '' })
    setFieldErrors({})
  }, [location.pathname])

  const handleTabChange = (tab: AuthTab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setFieldErrors({})
    setGeneralError(null)
    setForm((prev) => ({ ...prev, password: '' }))

    if (tab === 'login') {
      navigate('/login', { replace: true })
    } else {
      navigate('/signup', { replace: true })
    }
  }

  const handleChange = (field: keyof AuthForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (generalError) {
      setGeneralError(null)
    }
  }

  const validateForm = (): boolean => {
    const errors: FieldErrors = {}
    if (!form.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email address'
    }
    if (!form.password) {
      errors.password = 'Password is required'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }
    if (activeTab === 'signup' && !form.username) {
      errors.username = 'Username is required'
    } else if (activeTab === 'signup') {
      if (form.username.length < 5) {
        errors.username = 'Username must be at least 5 characters long'
      } else if (!/^[a-zA-Z0-9]+$/.test(form.username)) {
        errors.username = 'Username can only contain letters and numbers'
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})

    if (!validateForm()) {
      return
    }
    setIsSubmitting(true)
    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      if (activeTab === 'login') {
        const response = await authAPI.login(form.email, form.password)
        const { user, token } = response.data
        localStorage.setItem('token', token)
        dispatch(setAuth({ user, token }))
      } else {
        const response = await authAPI.signup(
          form.email,
          form.password,
          form.username
        )
        const { user, token } = response.data
        localStorage.setItem('token', token)
        dispatch(setAuth({ user, token }))
      }
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      const apiErrors = error?.response?.data?.errors

      if (apiErrors && Array.isArray(apiErrors)) {
        const fieldErrorMap: FieldErrors = {}
        apiErrors.forEach((err: { field: string; message: string }) => {
          if (
            err.field === 'email' ||
            err.field === 'password' ||
            err.field === 'username'
          ) {
            fieldErrorMap[err.field] = err.message
          }
        })
        if (Object.keys(fieldErrorMap).length > 0) {
          setFieldErrors(fieldErrorMap)
        } else {
          setGeneralError(
            apiMessage || error?.message || 'Something went wrong'
          )
        }
      } else {
        setGeneralError(apiMessage || error?.message || 'Something went wrong')
      }
      dispatch(
        setError(apiMessage || error?.message || 'Something went wrong')
      )
    } finally {
      setIsSubmitting(false)
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left side: Welcome content */}
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Welcome to DeDoup
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Your intelligent download manager with AI-powered organization
              and duplicate protection.
            </p>
          </div>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
              <span>
                Automatically block duplicate downloads before they clutter your
                disk
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
              <span>See how much storage you&apos;re saving across devices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
              <span>
                Stay in sync between the Chrome extension and this dashboard
              </span>
            </li>
          </ul>
        </div>

        {/* Right side: Auth card with tabs */}
        <div className="card animate-fade-in-up">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 -mx-6 px-6">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === 'login'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Forms with slide animation */}
          <div key={activeTab} className="animate-slide-in-right">
            {activeTab === 'login' ? (
              <LoginForm
                email={form.email}
                password={form.password}
                emailError={fieldErrors.email}
                passwordError={fieldErrors.password}
                generalError={generalError || undefined}
                isLoading={isSubmitting}
                onEmailChange={handleChange('email')}
                onPasswordChange={handleChange('password')}
                onSubmit={handleSubmit}
              />
            ) : (
              <SignupForm
                email={form.email}
                password={form.password}
                username={form.username}
                emailError={fieldErrors.email}
                passwordError={fieldErrors.password}
                usernameError={fieldErrors.username}
                generalError={generalError}
                isLoading={isSubmitting}
                onEmailChange={handleChange('email')}
                onPasswordChange={handleChange('password')}
                onUsernameChange={handleChange('username')}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}