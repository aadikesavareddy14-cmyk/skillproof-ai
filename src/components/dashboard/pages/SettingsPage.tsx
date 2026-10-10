import { useState } from 'react';
import { User, Bell, Shield, ShieldCheck, LogOut, Github, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { useAuth } from '@/context/AuthContext';

interface SettingsPageProps {
  onSignOut: () => void;
}

export function SettingsPage({ onSignOut }: SettingsPageProps) {
  const { profile, linkGoogle, unlinkGoogle, connectGithub, disconnectGithub, githubEmailMismatch, dismissGithubMismatch } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [googleAction, setGoogleAction] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [githubInput, setGithubInput] = useState('');
  const [githubAction, setGithubAction] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubConnectAnyway, setGithubConnectAnyway] = useState(false);

  const isGoogleConnected = profile.provider === 'google';
  const isGithubConnected = profile.githubConnected;

  const handleLinkGoogle = async () => {
    setGoogleError(null);
    setGoogleAction(true);
    try {
      const { error } = await linkGoogle();
      if (error) setGoogleError(error);
    } finally {
      setGoogleAction(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setGoogleError(null);
    setGoogleAction(true);
    try {
      const { error } = await unlinkGoogle();
      if (error) setGoogleError(error);
    } finally {
      setGoogleAction(false);
    }
  };

  const handleConnectGithub = async () => {
    setGithubError(null);
    setGithubAction(true);
    try {
      const { error, mismatch } = await connectGithub(githubInput.trim());
      if (error) {
        setGithubError(error);
      } else if (mismatch) {
        setGithubConnectAnyway(true);
      } else {
        setGithubInput('');
      }
    } finally {
      setGithubAction(false);
    }
  };

  const handleConnectAnyway = async () => {
    setGithubError(null);
    setGithubAction(true);
    try {
      const { error } = await connectGithub(githubInput.trim());
      if (error) setGithubError(error);
      setGithubConnectAnyway(false);
      setGithubInput('');
    } finally {
      setGithubAction(false);
    }
  };

  const handleDisconnectGithub = async () => {
    setGithubError(null);
    await disconnectGithub();
  };

  return (
    <div className="space-y-8 animate-fade-slide max-w-3xl">
      {/* Unified identity header */}
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

        <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name ?? 'Profile'}
              className="w-12 h-12 rounded-full border border-zinc-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-sm font-semibold text-white">
              {(profile.name ?? profile.email ?? 'SP').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">
              {profile.name ?? 'No name set'}
            </p>
            <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* SkillProof AI account */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-200">SkillProof AI account</span>
                <p className="text-xs text-zinc-500">{profile.email}</p>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          {/* Google account */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-200">
                  {isGoogleConnected ? 'Google' : 'Google account'}
                </span>
                <p className="text-xs text-zinc-500">
                  {isGoogleConnected ? `Synced as ${profile.email}` : 'Not connected'}
                </p>
              </div>
            </div>
            {isGoogleConnected ? (
              <div className="flex items-center gap-2">
                <Badge variant="success">Connected</Badge>
                <button
                  onClick={handleUnlinkGoogle}
                  disabled={googleAction}
                  className="press-scale px-2.5 py-1 rounded-lg border border-zinc-700 hover:border-red-800 text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleLinkGoogle}
                disabled={googleAction}
                className="press-scale px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                {googleAction ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {/* GitHub account */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Github className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-200">
                  {isGithubConnected ? `GitHub: ${profile.githubUsername}` : 'GitHub'}
                </span>
                <p className="text-xs text-zinc-500">
                  {isGithubConnected ? 'Connected and syncing repositories' : 'Not connected'}
                </p>
              </div>
            </div>
            {isGithubConnected ? (
              <div className="flex items-center gap-2">
                <Badge variant="success">Connected</Badge>
                <button
                  onClick={handleDisconnectGithub}
                  className="press-scale px-2.5 py-1 rounded-lg border border-zinc-700 hover:border-red-800 text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="GitHub username"
                  className="w-32 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs outline-none focus:border-blue-600 transition-colors placeholder-zinc-600"
                />
                <button
                  onClick={handleConnectGithub}
                  disabled={githubAction || !githubInput.trim()}
                  className="press-scale px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {githubAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                </button>
              </div>
            )}
          </div>
        </div>

        {googleError && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{googleError}</span>
          </div>
        )}
        {githubError && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{githubError}</span>
          </div>
        )}

        {/* GitHub email mismatch prompt */}
        {githubConnectAnyway && githubEmailMismatch && (
          <div className="mt-3 p-4 rounded-lg bg-amber-950/40 border border-amber-900/50">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">
                This GitHub account uses a different email ({githubEmailMismatch}) than your
                SkillProof AI account ({profile.email}). Connect anyway or use the matching account?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConnectAnyway}
                disabled={githubAction}
                className="press-scale px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                {githubAction ? 'Connecting...' : 'Connect anyway'}
              </button>
              <button
                onClick={() => { dismissGithubMismatch(); setGithubConnectAnyway(false); setGithubInput(''); }}
                className="press-scale px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition-colors"
              >
                Use matching account
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Account details */}
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

      {/* Security + Sign out */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">Security</h3>
        </div>
        <button className="press-scale px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-sm font-medium transition-colors mb-4">
          Change password
        </button>
        <div className="pt-4 border-t border-zinc-800/50">
          <button
            onClick={onSignOut}
            className="press-scale flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/30 border border-red-900/40 hover:border-red-800 text-red-400 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </Card>
    </div>
  );
}
