import { useState, useEffect } from 'react';
import { X, Github, Loader2, AlertCircle, Search, Link2 } from 'lucide-react';

interface GitHubConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnectOAuth: () => void;
  onConnectManual: (username: string) => Promise<{ error: string | null; mismatch?: boolean }>;
  onConfirmMismatch: (username: string) => Promise<{ error: string | null }>;
  mismatchEmail: string | null;
  userEmail: string | null;
}

export function GitHubConnectModal({
  open,
  onClose,
  onConnectOAuth,
  onConnectManual,
  onConfirmMismatch,
  mismatchEmail,
  userEmail,
}: GitHubConnectModalProps) {
  const [mode, setMode] = useState<'choose' | 'manual'>('choose');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('choose');
      setUsername('');
      setError(null);
      setLoading(false);
      setShowMismatch(false);
    }
  }, [open]);

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

  const handleOAuth = () => {
    setLoading(true);
    onConnectOAuth();
  };

  const handleManual = async () => {
    setError(null);
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    try {
      const { error, mismatch } = await onConnectManual(username.trim());
      if (error) {
        setError(error);
      } else if (mismatch) {
        setShowMismatch(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMismatch = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await onConfirmMismatch(username.trim());
      if (error) {
        setError(error);
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-1">
            <Github className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-zinc-100">Connect GitHub</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            Link your GitHub account so we can analyze your code as evidence.
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {showMismatch && mismatchEmail && (
            <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-900/50 mb-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">
                  This GitHub account uses a different email ({mismatchEmail}) than your
                  SkillProof AI account ({userEmail}). Connect anyway?
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmMismatch}
                  disabled={loading}
                  className="press-scale px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect anyway'}
                </button>
                <button
                  onClick={() => { setShowMismatch(false); setUsername(''); }}
                  className="press-scale px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showMismatch && (
            <>
              {mode === 'choose' && (
                <div className="space-y-3">
                  <button
                    onClick={handleOAuth}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50 text-zinc-200 font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Github className="w-5 h-5" />
                    )}
                    Connect with GitHub OAuth
                  </button>

                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-xs text-zinc-600 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <button
                    onClick={() => setMode('manual')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                    Enter username manually
                  </button>
                </div>
              )}

              {mode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                      GitHub username
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleManual(); }}
                        placeholder="e.g. octocat"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">
                      We'll verify the username exists on GitHub before connecting.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setMode('choose'); setError(null); setUsername(''); }}
                      className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleManual}
                      disabled={loading || !username.trim()}
                      className="press-scale flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
