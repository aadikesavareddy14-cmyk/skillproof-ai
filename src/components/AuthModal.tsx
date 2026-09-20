import { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  User,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SkillProofLogo } from '@/components/SkillProofLogo';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
  initialError?: string | null;
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
  label: 'Weak' | 'Medium' | 'Strong';
  color: string;
} {
  if (!password) {
    return { score: 0, label: 'Weak', color: 'bg-zinc-700' };
  }

  let score = 0;
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasMinLength && hasNumber) score = 1;
  if (score >= 1 && ((hasLower && hasUpper) || password.length >= 10)) score = 2;
  if (score >= 2 && (hasSpecial || password.length >= 12)) score = 3;

  if (score === 3) {
    return { score: 3, label: 'Strong', color: 'bg-teal-500' };
  }
  if (score === 2) {
    return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  }
  return { score: Math.max(score, 1), label: 'Weak', color: 'bg-red-500' };
}

export function AuthModal({
  open,
  onClose,
  initialMode = 'signup',
  initialError = null,
  onSuccess,
}: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password OTP flow state
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setErrors({});
      setAuthError(initialError);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setGoogleLoading(false);

      // Forgot state reset
      setForgotStep(1);
      setForgotEmail('');
      setResendCooldown(0);
      setForgotLoading(false);
      setOtp(['', '', '', '', '', '']);
      setVerifyLoading(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setResetSuccess(false);
      setResendSuccess(false);
    }
  }, [open, initialMode, initialError]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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
  const newPasswordStrength = forgotStep === 3 ? getPasswordStrength(newPassword) : null;

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
    } else if (mode === 'signup' && (password.length < 8 || !/\d/.test(password))) {
      errs.password = 'Password must be at least 8 characters with a number';
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) {
        console.error('[Google OAuth Error]:', error);
        setAuthError('Something went wrong signing in with Google — please try again');
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error('[Google OAuth Exception]:', err);
      setAuthError('Something went wrong signing in with Google — please try again');
      setGoogleLoading(false);
    }
  };

  // --- FORGOT PASSWORD (OTP) FLOW HANDLERS ---
  const handleStartForgotPassword = () => {
    setForgotEmail(email.trim());
    setForgotStep(1);
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setResetSuccess(false);
    setResendSuccess(false);
    setAuthError(null);
    setMode('forgot');
  };

  const handleBackToLogin = () => {
    setMode('signin');
    setForgotStep(1);
    setOtp(['', '', '', '', '', '']);
    setAuthError(null);
    setResetSuccess(false);
    setResendSuccess(false);
  };

  // Step 1: Request 6-digit code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResendSuccess(false);

    if (!forgotEmail.trim()) {
      setAuthError('Email is required');
      return;
    }
    if (!validateEmail(forgotEmail.trim())) {
      setAuthError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: forgotEmail.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        console.error('[signInWithOtp Error]:', error);
        const lower = error.message.toLowerCase();
        if (lower.includes('rate limit') || lower.includes('security purposes') || lower.includes('too many')) {
          setAuthError('Too many requests. Please wait a moment before trying again.');
        } else if (lower.includes('signups not allowed') || lower.includes('user not found')) {
          setAuthError('No account found with this email address.');
        } else {
          setAuthError(error.message || 'Something went wrong sending the code — please try again');
        }
        return;
      }

      setForgotStep(2);
      setResendCooldown(30);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error('[signInWithOtp Exception]:', err);
      setAuthError('Something went wrong sending the code — please try again');
    } finally {
      setForgotLoading(false);
    }
  };

  // Resend 6-digit code in Step 2
  const handleResendCode = async () => {
    if (resendCooldown > 0 || forgotLoading) return;
    setForgotLoading(true);
    setAuthError(null);
    setResendSuccess(false);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: forgotEmail.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        console.error('[Resend OTP Error]:', error);
        const lower = error.message.toLowerCase();
        if (lower.includes('rate limit') || lower.includes('security purposes')) {
          setAuthError('Too many requests. Please wait a moment before trying again.');
        } else {
          setAuthError('Something went wrong resending the code — please try again');
        }
      } else {
        setResendCooldown(30);
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 4000);
      }
    } catch (err) {
      console.error('[Resend OTP Exception]:', err);
      setAuthError('Something went wrong resending the code — please try again');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (token: string) => {
    if (token.length !== 6) return;
    setVerifyLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: forgotEmail.trim(),
        token,
        type: 'email',
      });

      if (error || !data.session) {
        console.error('[verifyOtp Error]:', error);
        setAuthError('Invalid or expired code — please try again');
        return;
      }

      // Success: session established, user proceeds to Step 3
      setForgotStep(3);
      setAuthError(null);
    } catch (err) {
      console.error('[verifyOtp Exception]:', err);
      setAuthError('Invalid or expired code — please try again');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const nextOtp = [...otp];
      nextOtp[index] = '';
      setOtp(nextOtp);
      return;
    }

    const digit = cleaned[cleaned.length - 1];
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    // Auto-advance focus to next digit box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit once all 6 are filled
    const fullCode = nextOtp.join('');
    if (fullCode.length === 6 && nextOtp.every((d) => d !== '')) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const nextOtp = [...otp];
        nextOtp[index] = '';
        setOtp(nextOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nextOtp = [...otp];
        nextOtp[index - 1] = '';
        setOtp(nextOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const nextOtp = [...otp];
    digits.forEach((d, i) => {
      if (i < 6) nextOtp[i] = d;
    });
    setOtp(nextOtp);

    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerifyOtp(pastedData);
    }
  };

  // Step 3: Set new password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (newPassword.length < 8) {
      setAuthError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('[updateUser Error]:', error);
        setAuthError(error.message || 'Something went wrong updating your password — please try again');
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        onSuccess?.(false);
      }, 1200);
    } catch (err) {
      console.error('[updateUser Exception]:', err);
      setAuthError('Something went wrong updating your password — please try again');
    } finally {
      setForgotLoading(false);
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
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center mb-6">
            <SkillProofLogo variant="full" size="auth" />
          </div>

          {mode === 'forgot' ? (
            <div>
              {/* Back to Login */}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-4 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back to log in</span>
              </button>

              {/* Step indicator: Email → Verify → Password */}
              <div className="flex items-center justify-between mb-6 px-1">
                {[
                  { step: 1, label: 'Email' },
                  { step: 2, label: 'Verify' },
                  { step: 3, label: 'Password' },
                ].map((item, idx) => (
                  <div key={item.step} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        forgotStep === item.step
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : forgotStep > item.step
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {forgotStep > item.step ? '✓' : item.step}
                    </div>
                    <span
                      className={`text-xs ${
                        forgotStep === item.step
                          ? 'text-zinc-200 font-medium'
                          : forgotStep > item.step
                          ? 'text-zinc-400'
                          : 'text-zinc-500'
                      }`}
                    >
                      {item.label}
                    </span>
                    {idx < 2 && <div className="w-6 sm:w-8 h-[1px] bg-zinc-800 mx-1" />}
                  </div>
                ))}
              </div>

              {/* STEP 1: Request 6-digit code */}
              {forgotStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold mb-1 text-zinc-100">
                    Reset your password
                  </h2>
                  <p className="text-sm text-zinc-400 mb-6">
                    Enter your account email and we'll send you a 6-digit verification code.
                  </p>

                  {authError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4 animate-fade-slide">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoFocus
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        'Send verification code'
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2: Verify 6-digit OTP */}
              {forgotStep === 2 && (
                <div className="animate-fade-slide">
                  <h2 className="text-2xl font-bold mb-1 text-zinc-100">
                    Enter 6-digit code
                  </h2>
                  <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                    We've sent a 6-digit code to{' '}
                    <span className="text-zinc-200 font-medium break-all">{forgotEmail}</span>.
                    It expires in 10 minutes.
                  </p>

                  {resendSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-950/40 border border-teal-900/50 text-xs text-teal-400 mb-4 animate-fade-slide">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>A new 6-digit verification code has been sent.</span>
                    </div>
                  )}

                  {authError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4 animate-fade-slide">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{authError}</span>
                    </div>
                  )}

                  {/* 6 Individual Digit Boxes */}
                  <div className="flex items-center justify-between gap-2 sm:gap-2.5 my-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className={`w-12 h-14 sm:w-13 sm:h-14 text-center text-xl font-bold rounded-xl bg-zinc-900 border ${
                          authError
                            ? 'border-red-900/60 text-red-300'
                            : digit
                            ? 'border-blue-500 text-white'
                            : 'border-zinc-800 text-white'
                        } focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all`}
                        disabled={verifyLoading}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp(otp.join(''))}
                    disabled={verifyLoading || otp.some((d) => !d)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {verifyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying code...
                      </>
                    ) : (
                      'Verify code'
                    )}
                  </button>

                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
                    <span>Didn't receive the code?</span>
                    {resendCooldown > 0 ? (
                      <span className="text-zinc-500 font-medium">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={forgotLoading}
                        className="text-blue-500 hover:text-blue-400 font-medium transition-colors disabled:opacity-50"
                      >
                        {forgotLoading ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Set new password */}
              {forgotStep === 3 && (
                <div className="animate-fade-slide">
                  {resetSuccess ? (
                    <div className="py-6 flex flex-col items-center text-center animate-fade-slide">
                      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 shadow-lg shadow-teal-500/5">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Password reset successfully
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        Redirecting to your dashboard...
                      </p>
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-1 text-zinc-100">
                        Set new password
                      </h2>
                      <p className="text-sm text-zinc-400 mb-6">
                        Choose a new password for your account (minimum 8 characters).
                      </p>

                      {authError && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4 animate-fade-slide">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="leading-snug">{authError}</span>
                        </div>
                      )}

                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                            New password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="At least 8 characters"
                              autoFocus
                              className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {newPasswordStrength && newPassword.length > 0 && (
                            <div className="mt-2">
                              <div className="flex gap-1">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                      i <= newPasswordStrength.score ? newPasswordStrength.color : 'bg-zinc-800'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="mt-1 text-xs text-zinc-500">
                                Password strength: <span className="text-zinc-300">{newPasswordStrength.label}</span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                            Confirm new password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                              type={showConfirmNewPassword ? 'text' : 'password'}
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Re-enter your new password"
                              className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                              aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                            >
                              {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={forgotLoading || !newPassword || !confirmNewPassword}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {forgotLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Updating password...
                            </>
                          ) : (
                            'Reset password'
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Footer */}
              <p className="mt-6 text-center text-sm text-zinc-500">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  Log in
                </button>
              </p>
            </div>
          ) : (
            <div>
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

              <h2 className="text-2xl font-bold mb-1 text-zinc-100">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-zinc-400 mb-6">
                {mode === 'signup'
                  ? 'Start verifying your skills in minutes.'
                  : 'Sign in to access your verified skill profile.'}
              </p>

              {authError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4 animate-fade-slide">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{authError}</span>
                </div>
              )}

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-200 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm mb-4"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Manual Credentials Form */}
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
                  {mode === 'signin' && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={handleStartForgotPassword}
                        className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                  {strength && password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
