import { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: (isNewUser: boolean) => void;
}

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too short', color: 'bg-zinc-700' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-teal-500' },
    { label: 'Excellent', color: 'bg-teal-400' },
  ];

  const idx = Math.min(score, 5);
  return { score: idx, label: levels[idx].label, color: levels[idx].color };
}

export function AuthModal({ open, onClose, initialMode = 'signup', onSuccess }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setErrors({});
      setAuthError(null);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const strength = mode === 'signup' ? getPasswordStrength(password) : null;

  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (mode === 'signup' && !name.trim()) {
      errs.name = 'Name is required';
    }

    if (!email) {
      errs.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (mode === 'signup' && password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup' && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, name.trim());
        if (error) {
          setAuthError(error);
        } else {
          onSuccess?.(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setAuthError(error);
        } else {
          onSuccess?.(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) setAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-7 h-7 text-blue-500" strokeWidth={2.2} />
            <span className="text-lg font-semibold tracking-tight">
              SkillProof<span className="text-blue-500"> AI</span>
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-6">
            <button
              onClick={() => { setMode('signin'); setErrors({}); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signin' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode('signup'); setErrors({}); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign up
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-1">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            {mode === 'signup'
              ? 'Start verifying your skills in minutes.'
              : 'Sign in to access your verified skill profile.'}
          </p>

          {authError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50 text-zinc-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border ${
                      errors.name ? 'border-red-900/60' : 'border-zinc-800'
                    } text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border ${
                    errors.email ? 'border-red-900/60' : 'border-zinc-800'
                  } text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-900 border ${
                    errors.password ? 'border-red-900/60' : 'border-zinc-800'
                  } text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
              {strength && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.score ? strength.color : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Password strength: <span className="text-zinc-300">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border ${
                      errors.confirmPassword ? 'border-red-900/60' : 'border-zinc-800'
                    } text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                mode === 'signup' ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setErrors({}); setAuthError(null); }}
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setErrors({}); setAuthError(null); }}
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  Sign up free
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
