declare const chrome: any;
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { setAuth, setLoading, setError } from '../store/slices/authSlice';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import clsx from 'clsx';
import { useAppSelector } from '../store/hooks';
import type { AuthForm, FieldErrors } from '../types/pages';

type AuthTab = 'login' | 'signup';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [form, setForm] = useState<AuthForm>({
    email: '',
    password: '',
    username: '',
    passwordConfirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormDirty = Object.values(form).some((value) => value !== '');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/home', { replace: true });
    }
  }, [navigate, isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (location.pathname.includes('signup')) {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
    setGeneralError(null);
    setForm({ email: '', password: '', username: '', passwordConfirm: '' });
    setFieldErrors({});
    setShowPassword(false);
    setShowPasswordConfirm(false);
  }, [location.pathname]);

  const handleTabChange = (tab: AuthTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setFieldErrors({});
    setGeneralError(null);
    setForm((prev) => ({ ...prev, password: '', passwordConfirm: '' }));

    if (tab === 'login') {
      navigate('/login', { replace: true });
    } else {
      navigate('/signup', { replace: true });
    }
  };

  const handleClearField = (field: keyof AuthForm) => () => {
    setForm((prev) => ({ ...prev, [field]: '' }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleTogglePasswordConfirm = () => {
    setShowPasswordConfirm((prev) => !prev);
  };

  const handleChange = (field: keyof AuthForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // Email validation
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email address';
    }

    // Password validation
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Signup-specific validations
    if (activeTab === 'signup') {
      // Username validation
      if (!form.username) {
        errors.username = 'Username is required';
      } else if (form.username.length < 5) {
        errors.username = 'Username must be at least 5 characters long';
      } else if (!/^[a-zA-Z0-9]+$/.test(form.username)) {
        errors.username = 'Username can only contain letters and numbers';
      }

      // Password confirmation validation
      if (!form.passwordConfirm) {
        errors.passwordConfirm = 'Please confirm your password';
      } else if (form.password !== form.passwordConfirm) {
        errors.passwordConfirm = 'Passwords do not match';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReset = () => {
    setForm({ email: '', password: '', username: '', passwordConfirm: '' });
    setFieldErrors({});
    setGeneralError(null);
    setShowPassword(false);
    setShowPasswordConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      if (activeTab === 'login') {
        const response = await authAPI.login(form.email, form.password);
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        dispatch(setAuth({ user, token: { accessToken: token } }));

        // Send auth token to extension
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage(
              'cloapgfdggjcdpdhhljidmpjcockcggb',
              {
                type: 'AUTH_SUCCESS',
                payload: {
                  user,
                  token,
                },
              },
              (response: any) => {
                if (chrome.runtime.lastError) {
                  console.log('Extension not installed or not responding');
                } else {
                  console.log('Token sent to extension:', response);
                }
              },
            );
          }
        } catch (error) {
          console.log('Could not communicate with extension:', error);
        }
      } else {
        const response = await authAPI.signup(form.email, form.password, form.username);
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        dispatch(setAuth({ user, token: { accessToken: token } }));

        // Send auth token to extension
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage(
              'cloapgfdggjcdpdhhljidmpjcockcggb',
              {
                type: 'AUTH_SUCCESS',
                payload: {
                  user,
                  token,
                },
              },
              (response: any) => {
                if (chrome.runtime.lastError) {
                  console.log('Extension not installed or not responding');
                } else {
                  console.log('Token sent to extension:', response);
                }
              },
            );
          }
        } catch (error) {
          console.log('Could not communicate with extension:', error);
        }
      }
      navigate('/home', { replace: true });
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && Array.isArray(apiErrors)) {
        const fieldErrorMap: FieldErrors = {};
        apiErrors.forEach((err: { field: string; message: string }) => {
          if (err.field === 'email' || err.field === 'password' || err.field === 'username') {
            fieldErrorMap[err.field] = err.message;
          }
        });
        if (Object.keys(fieldErrorMap).length > 0) {
          setFieldErrors(fieldErrorMap);
        } else {
          setGeneralError(apiMessage || error?.message || 'Something went wrong');
        }
      } else {
        setGeneralError(apiMessage || error?.message || 'Something went wrong');
      }
      dispatch(setError(apiMessage || error?.message || 'Something went wrong'));
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left side: Welcome content + illustration */}
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up">
          {/* Title Block */}
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight">
              Welcome to <span className="text-primary-600">Surf</span>
              <span className="text-gray-900">Bud</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-gray-600">
              Your intelligent web activity tracker
            </p>
          </div>

          {/* Illustration */}
          <div className="w-full flex justify-center">
            <img
              src="/Images/Login_Page_Image.png"
              alt="SurfBud web activity tracker"
              className="max-w-md w-full object-contain"
            />
          </div>
        </div>

        {/* Right side: Auth card with tabs */}
        <div
          className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1.5 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={clsx(
                'flex-1 py-3 px-4 text-base font-semibold rounded-lg transition-all duration-200',
                activeTab === 'login'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={clsx(
                'flex-1 py-3 px-4 text-base font-semibold rounded-lg transition-all duration-200',
                activeTab === 'signup'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              )}
            >
              Sign up
            </button>
          </div>

          {/* Forms - with directional slide animation */}
          <div
            key={activeTab}
            className={activeTab === 'login' ? 'animate-slide-in-left' : 'animate-slide-in-right'}
          >
            {generalError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-800">{generalError}</p>
              </div>
            )}

            {activeTab === 'login' ? (
              <LoginForm
                email={form.email}
                password={form.password}
                emailError={fieldErrors.email}
                passwordError={fieldErrors.password}
                generalError={generalError || undefined}
                isLoading={isSubmitting}
                isDirty={isFormDirty}
                showPassword={showPassword}
                onReset={handleReset}
                onEmailChange={handleChange('email')}
                onPasswordChange={handleChange('password')}
                onClearEmail={handleClearField('email')}
                onClearPassword={handleClearField('password')}
                onTogglePassword={handleTogglePassword}
                onSubmit={handleSubmit}
              />
            ) : (
              <SignupForm
                email={form.email}
                password={form.password}
                passwordConfirm={form.passwordConfirm}
                username={form.username}
                emailError={fieldErrors.email}
                passwordError={fieldErrors.password}
                passwordConfirmError={fieldErrors.passwordConfirm}
                usernameError={fieldErrors.username}
                generalError={generalError}
                isLoading={isSubmitting}
                isDirty={isFormDirty}
                showPassword={showPassword}
                showPasswordConfirm={showPasswordConfirm}
                onReset={handleReset}
                onEmailChange={handleChange('email')}
                onPasswordChange={handleChange('password')}
                onUsernameChange={handleChange('username')}
                onPasswordConfirmChange={handleChange('passwordConfirm')}
                onClearEmail={handleClearField('email')}
                onClearUsername={handleClearField('username')}
                onClearPassword={handleClearField('password')}
                onClearPasswordConfirm={handleClearField('passwordConfirm')}
                onTogglePassword={handleTogglePassword}
                onTogglePasswordConfirm={handleTogglePasswordConfirm}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
