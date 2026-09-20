import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SkillProofLogo } from '@/components/SkillProofLogo';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onRequestNewLink: () => void;
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

export function ResetPasswordPage({ onSuccess, onRequestNewLink }: ResetPasswordPageProps) {
  const [status, setStatus] = useState<'verifying' | 'ready' | 'expired'>('verifying');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let resolved = false;

    // 1. Check for error parameters in URL hash or query params
    const hash = window.location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(window.location.search);

    const errorParam = searchParams.get('error') || hashParams.get('error');
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
    const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

    if (errorParam || errorCode || errorDesc) {
      console.warn('[ResetPasswordPage] URL contains auth error:', { errorParam, errorCode, errorDesc });
      setStatus('expired');
      return;
    }

    // 2. Listen for Supabase auth state change (PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        resolved = true;
        setStatus('ready');
      } else if (session?.user && !resolved) {
        resolved = true;
        setStatus('ready');
      }
    });

    // 3. Fallback: check getSession()
    supabase.auth.getSession().then(({ data: { session }, error: sessionErr }) => {
      if (resolved) return;

      if (sessionErr) {
        console.error('[ResetPasswordPage] getSession error:', sessionErr);
        setStatus('expired');
        return;
      }

      if (session?.user) {
        resolved = true;
        setStatus('ready');
      } else {
        // Allow a short window for Supabase client to parse the URL hash/code
        setTimeout(() => {
          if (!resolved) {
            supabase.auth.getSession().then(({ data: secondCheck }) => {
              if (secondCheck.session?.user) {
                setStatus('ready');
              } else {
                setStatus('expired');
              }
            });
          }
        }, 1200);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setError('Password must be at least 8 characters and include at least one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        console.error('[ResetPasswordPage] updateUser error:', updateErr);
        setError(updateErr.message || 'Something went wrong — please try again');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error('[ResetPasswordPage] updateUser exception:', err);
      setError('Something went wrong — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-8 z-10">
        <div className="flex flex-col items-center justify-center mb-6">
          <SkillProofLogo variant="full" size="auth" />
        </div>

        {/* Step indicator: Email -> Check inbox -> New password */}
        <div className="flex items-center justify-between mb-6 px-1">
          {[
            { step: 1, label: 'Email' },
            { step: 2, label: 'Check inbox' },
            { step: 3, label: 'New password' },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  item.step < 3
                    ? 'bg-blue-600/20 text-blue-400'
                    : status === 'ready' || success
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {item.step < 3 ? '✓' : item.step}
              </div>
              <span
                className={`text-xs ${
                  item.step === 3 && (status === 'ready' || success)
                    ? 'text-zinc-200 font-medium'
                    : item.step < 3
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

        {/* State 1: Verifying link */}
        {status === 'verifying' && (
          <div className="py-12 flex flex-col items-center text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <h2 className="text-lg font-bold text-zinc-100 mb-1">
              Verifying recovery link...
            </h2>
            <p className="text-sm text-zinc-400">
              Please wait while we secure your recovery session.
            </p>
          </div>
        )}

        {/* State 2: Link is expired or invalid */}
        {status === 'expired' && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">
              Reset link expired
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              This reset link has expired — please request a new one.
            </p>
            <button
              type="button"
              onClick={onRequestNewLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              Request a new reset link
            </button>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.location.href = '/';
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>
          </div>
        )}

        {/* State 3: Ready to reset password */}
        {status === 'ready' && (
          <>
            {success ? (
              <div className="py-6 flex flex-col items-center text-center animate-fade-slide">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 shadow-lg shadow-teal-500/5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Password reset successfully
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Redirecting you to your dashboard...
                </p>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-1 text-zinc-100">
                  Set new password
                </h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Choose a new password for your account. Minimum 8 characters with at least one number.
                </p>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4 animate-fade-slide">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        placeholder="At least 8 characters & 1 number"
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
                    {newPassword.length > 0 && (
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

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !newPassword || !confirmPassword}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      'Update password'
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
