import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Mail,
  LogOut,
  AlertCircle,
  Loader2,
  Link2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { OAuthProvider } from '@/lib/authErrors';

interface SettingsPageProps {
  onSignOut: () => void;
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

export function SettingsPage({ onSignOut }: SettingsPageProps) {
  const {
    user,
    profile,
    identities,
    linkOAuth,
    unlinkOAuth,
  } = useAuth();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!passwordSuccess) return;
    const timer = setTimeout(() => {
      setPasswordSuccess(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [passwordSuccess]);

  const newPasswordStrength = getPasswordStrength(newPassword);
  const isPasswordSubmitDisabled =
    passwordLoading ||
    !currentPassword.trim() ||
    !newPassword ||
    !confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const userEmail = profile.email || user?.email;
    if (!userEmail) {
      setPasswordError('Unable to identify user account. Please refresh and try again.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all three password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setPasswordError('Password must be at least 8 characters and include at least one number.');
      return;
    }

    setPasswordLoading(true);
    try {
      // 1. Re-authenticate user with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError('Current password is incorrect.');
        return;
      }

      // 2. Call updateUser to set new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('[Change Password Error]:', updateError);
        setPasswordError('Something went wrong — please try again');
        return;
      }

      // 3. Success
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error('[Change Password Exception]:', err);
      setPasswordError('Something went wrong — please try again');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Identity presence checks
  const isGoogleConnected =
    identities.includes('google') || profile.provider === 'google';

  const isLinkedInConnected =
    identities.includes('linkedin_oidc') ||
    identities.includes('linkedin') ||
    profile.provider === 'linkedin_oidc';

  const isEmailConnected =
    identities.includes('email') ||
    profile.provider === 'email' ||
    Boolean(profile.email);

  const connectedCount =
    (isGoogleConnected ? 1 : 0) +
    (isLinkedInConnected ? 1 : 0) +
    (isEmailConnected ? 1 : 0);

  const handleConnectOAuth = async (provider: OAuthProvider) => {
    setAccountError(null);
    setActionLoading(`connect_${provider}`);
    try {
      const { error } = await linkOAuth(provider);
      if (error) {
        setAccountError(error);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnectOAuth = async (provider: OAuthProvider) => {
    setAccountError(null);
    setActionLoading(`disconnect_${provider}`);
    try {
      const { error } = await unlinkOAuth(provider);
      if (error) {
        setAccountError(error);
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-slide max-w-3xl">
      {/* Unified Profile & Connected Accounts */}
      <Card hover={false} gradient className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-200">Connected as</h3>
            <p className="text-sm text-zinc-500">{profile.email}</p>
          </div>
        </div>

        {/* Profile Card Summary */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 mb-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name ?? 'Profile'}
              className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-sm font-semibold text-white">
              {(profile.name ?? profile.email ?? 'SP').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-100 truncate">
              {profile.name ?? 'No name set'}
            </p>
            <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
          </div>
        </div>

        {/* Connected accounts section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-zinc-200">Connected accounts</h4>
            </div>
            <span className="text-xs text-zinc-500">
              {connectedCount} of 3 linked
            </span>
          </div>

          <div className="space-y-3">
            {/* 1. Google Account */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">Google</span>
                    {isGoogleConnected && <Badge variant="success" size="sm">Connected</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {isGoogleConnected ? `Synced as ${profile.email}` : 'Sign in quickly with your Google account'}
                  </p>
                </div>
              </div>

              <div>
                {isGoogleConnected ? (
                  <button
                    onClick={() => handleDisconnectOAuth('google')}
                    disabled={actionLoading === 'disconnect_google'}
                    className="press-scale px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-red-800 text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'disconnect_google' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Disconnect'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectOAuth('google')}
                    disabled={actionLoading === 'connect_google'}
                    className="press-scale px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading === 'connect_google' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 2. LinkedIn Account */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">LinkedIn</span>
                    {isLinkedInConnected && <Badge variant="success" size="sm">Connected</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {isLinkedInConnected ? 'Linked and verifying credentials' : 'Connect to sync your verified work experience'}
                  </p>
                </div>
              </div>

              <div>
                {isLinkedInConnected ? (
                  <button
                    onClick={() => handleDisconnectOAuth('linkedin_oidc')}
                    disabled={actionLoading === 'disconnect_linkedin_oidc'}
                    className="press-scale px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-red-800 text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'disconnect_linkedin_oidc' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Disconnect'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectOAuth('linkedin_oidc')}
                    disabled={actionLoading === 'connect_linkedin_oidc'}
                    className="press-scale px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading === 'connect_linkedin_oidc' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 3. Email Account */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">Email</span>
                    <Badge variant={connectedCount > 1 ? 'neutral' : 'success'} size="sm">
                      {connectedCount > 1 ? 'Active' : 'Primary'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {profile.email} · Password authentication
                  </p>
                </div>
              </div>

              <div>
                <button
                  disabled={connectedCount <= 1}
                  title={connectedCount <= 1 ? 'Cannot disconnect your sole login method' : 'Disconnect email login'}
                  className="press-scale px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-500 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {connectedCount <= 1 ? 'Primary' : 'Disconnect'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Error Banner */}
        {accountError && (
          <div className="mt-4 flex items-start gap-2 p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 animate-fade-slide">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{accountError}</span>
          </div>
        )}
      </Card>

      {/* Account Details */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">Profile Details</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={profile.email ?? ''}
                readOnly
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm outline-none"
              />
              <Badge variant="success">Verified</Badge>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Display name</label>
            <input
              type="text"
              defaultValue={profile.name ?? ''}
              placeholder="Your name"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-blue-600 transition-colors placeholder-zinc-600"
            />
          </div>
          <button className="press-scale px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            Save changes
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">Notifications</h3>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Email notifications', desc: 'Receive emails about your account', state: emailNotifs, setter: setEmailNotifs },
            { label: 'Job alerts', desc: 'Get notified when new jobs match your skills', state: jobAlerts, setter: setJobAlerts },
            { label: 'Weekly report', desc: 'A weekly summary of your profile and matches', state: weeklyReport, setter: setWeeklyReport },
            { label: 'Product updates', desc: 'News about new features and improvements', state: productUpdates, setter: setProductUpdates },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-zinc-200">{item.label}</span>
                <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => item.setter(!item.state)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  item.state ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    item.state ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Account Security: Change Password & Sign out */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-200">Account Security</h3>
            <p className="text-xs text-zinc-500">Update your password to keep your account safe</p>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-4 mb-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Current password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="Enter current password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="At least 8 characters with a number"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        step <= newPasswordStrength.score ? newPasswordStrength.color : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-1 text-xs">
                  <span className="text-zinc-500">
                    Strength: <span className="font-medium text-zinc-300">{newPasswordStrength.label}</span>
                  </span>
                  <span className="text-zinc-500">Min 8 chars, 1 number</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="Re-enter your new password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Inline Error */}
          {passwordError && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 animate-fade-slide">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Inline Success Toast */}
          {passwordSuccess && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-sm animate-fade-slide">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{passwordSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setPasswordSuccess(null)}
                className="text-emerald-500 hover:text-emerald-300 p-0.5 transition-colors"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPasswordSubmitDisabled}
              className="press-scale px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Update password'
              )}
            </button>
          </div>
        </form>

        <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-zinc-200">Sign out</span>
            <p className="text-xs text-zinc-500 mt-0.5">Sign out of your account on this device</p>
          </div>
          <button
            onClick={onSignOut}
            className="press-scale flex items-center gap-2 px-4 py-2 rounded-xl border border-red-900/50 hover:bg-red-950/30 text-red-400 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </Card>
    </div>
  );
}
