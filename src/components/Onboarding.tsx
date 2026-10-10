import { useState, useRef } from 'react';
import { ShieldCheck, Github, FileText, ArrowRight, CheckCircle2, Loader2, AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx'];
const MAX_SIZE = 5 * 1024 * 1024;

function isAcceptedType(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_TYPES.some((ext) => name.endsWith(ext));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { profile, connectGithub, githubEmailMismatch, dismissGithubMismatch, uploadResume } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [githubInput, setGithubInput] = useState('');
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubConnectAnyway, setGithubConnectAnyway] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGithubConnected = profile.githubConnected;
  const isResumeUploaded = profile.resumeUploaded;

  const handleConnectGithub = async () => {
    setGithubError(null);
    setConnecting(true);
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
      setConnecting(false);
    }
  };

  const handleConnectAnyway = async () => {
    setGithubError(null);
    setConnecting(true);
    try {
      const { error } = await connectGithub(githubInput.trim(), true);
      if (error) setGithubError(error);
      setGithubConnectAnyway(false);
      setGithubInput('');
    } finally {
      setConnecting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedType(file)) {
      setResumeError('Please upload a PDF or Word document');
      return;
    }

    if (file.size > MAX_SIZE) {
      setResumeError('File is too large — maximum 5MB');
      return;
    }

    setResumeFile(file);
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    setResumeUploading(true);
    await uploadResume(resumeFile.name, resumeFile.size);
    setResumeUploading(false);
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canProceed = isGithubConnected || isResumeUploaded;

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
      <header className="border-b border-zinc-800/50 glass">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-16 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-blue-500" strokeWidth={2.2} />
          <span className="text-lg font-semibold tracking-tight">
            SkillProof<span className="text-blue-500"> AI</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.name ?? 'Profile'}
                className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-zinc-700"
              />
            )}
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome{profile.name ? `, ${profile.name}` : ''}!
            </h1>
            <p className="text-zinc-400 max-w-md mx-auto">
              Let's set up your verified skill profile. Connect at least one source
              so SkillProof AI can start building your evidence-backed profile.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {/* GitHub */}
            <div className={`p-6 rounded-2xl border bg-zinc-900/40 transition-all ${
              isGithubConnected ? 'border-teal-500/30' : 'border-zinc-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isGithubConnected ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-zinc-800/50 border border-zinc-700/50'
                  }`}>
                    {isGithubConnected ? (
                      <CheckCircle2 className="w-6 h-6 text-teal-500" />
                    ) : (
                      <Github className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">Connect GitHub</h3>
                    <p className="text-sm text-zinc-500">
                      {isGithubConnected
                        ? `Connected as ${profile.githubUsername} — repositories being analyzed`
                        : 'Pull code evidence from your repositories'}
                    </p>
                  </div>
                </div>
                {!isGithubConnected && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      placeholder="GitHub username"
                      className="w-32 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm outline-none focus:border-blue-600 transition-colors placeholder-zinc-600"
                    />
                    <button
                      onClick={handleConnectGithub}
                      disabled={connecting || !githubInput.trim()}
                      className="press-scale flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Connect
                    </button>
                  </div>
                )}
              </div>

              {githubError && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{githubError}</span>
                </div>
              )}

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
                      disabled={connecting}
                      className="press-scale px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {connecting ? 'Connecting...' : 'Connect anyway'}
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
            </div>

            {/* Resume */}
            <div className={`p-6 rounded-2xl border bg-zinc-900/40 transition-all ${
              isResumeUploaded ? 'border-teal-500/30' : 'border-zinc-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isResumeUploaded ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-zinc-800/50 border border-zinc-700/50'
                  }`}>
                    {isResumeUploaded ? (
                      <CheckCircle2 className="w-6 h-6 text-teal-500" />
                    ) : (
                      <FileText className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">Upload Resume</h3>
                    <p className="text-sm text-zinc-500">
                      {isResumeUploaded
                        ? `Uploaded — ${profile.resumeFileName ?? 'resume.pdf'}`
                        : 'PDF or DOCX, up to 5MB'}
                    </p>
                  </div>
                </div>
                {!isResumeUploaded && (
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {resumeFile ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs">
                          <FileText className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-zinc-300 max-w-[100px] truncate">{resumeFile.name}</span>
                          <span className="text-zinc-600">{formatSize(resumeFile.size)}</span>
                          <button
                            onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="text-zinc-600 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                        <button
                          onClick={handleUploadResume}
                          disabled={resumeUploading}
                          className="press-scale flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {resumeUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="press-scale flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    )}
                  </div>
                )}
              </div>

              {resumeError && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resumeError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onComplete}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={onComplete}
              disabled={!canProceed}
              className="press-scale group flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
