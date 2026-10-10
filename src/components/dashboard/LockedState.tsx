import { useState } from 'react';
import { CheckCircle2, Circle, FileText, Github, Loader2, Lock } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { ResumeUploadModal } from '@/components/dashboard/ResumeUploadModal';
import { GitHubConnectModal } from '@/components/dashboard/GitHubConnectModal';
import { useAuth } from '@/context/AuthContext';

interface LockedStateProps {
  resumeUploaded: boolean;
  githubConnected: boolean;
  title?: string;
  message?: string;
}

export function LockedState({
  resumeUploaded,
  githubConnected,
  title = 'Your skill score is locked',
  message = 'Upload your resume and connect GitHub to unlock your verified skill score.',
}: LockedStateProps) {
  const { uploadResume, connectGithub, githubEmailMismatch, dismissGithubMismatch, profile } = useAuth();
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  const bothDone = resumeUploaded && githubConnected;

  const handleResumeConfirm = (file: File) => {
    uploadResume(file.name, file.size);
    setResumeModalOpen(false);
  };

  const handleGithubOAuth = () => {
    connectGithub('oauth-user').then(({ error }) => {
      if (!error) setGithubModalOpen(false);
    });
  };

  const handleGithubManual = async (username: string) => {
    return connectGithub(username);
  };

  const handleConfirmMismatch = async (username: string) => {
    return connectGithub(username, true);
  };

  return (
    <>
      <Card hover={false} gradient className="p-10 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100 mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-8 max-w-sm mx-auto">{message}</p>

        <div className="space-y-3 mb-8 max-w-xs mx-auto text-left">
          {/* Resume row */}
          <button
            onClick={() => !resumeUploaded && setResumeModalOpen(true)}
            disabled={resumeUploaded}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
              resumeUploaded
                ? 'border-teal-500/20 bg-teal-500/5 cursor-default'
                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 cursor-pointer'
            }`}
          >
            {resumeUploaded ? (
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
            )}
            <div className="flex items-center gap-2 flex-1">
              <FileText className={`w-4 h-4 ${resumeUploaded ? 'text-teal-400' : 'text-zinc-500'}`} />
              <span className={`text-sm ${resumeUploaded ? 'text-teal-300' : 'text-zinc-300'}`}>
                {resumeUploaded ? 'Resume uploaded' : 'Upload your resume'}
              </span>
            </div>
          </button>

          {/* GitHub row */}
          <button
            onClick={() => !githubConnected && setGithubModalOpen(true)}
            disabled={githubConnected}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
              githubConnected
                ? 'border-teal-500/20 bg-teal-500/5 cursor-default'
                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 cursor-pointer'
            }`}
          >
            {githubConnected ? (
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
            )}
            <div className="flex items-center gap-2 flex-1">
              <Github className={`w-4 h-4 ${githubConnected ? 'text-teal-400' : 'text-zinc-500'}`} />
              <span className={`text-sm ${githubConnected ? 'text-teal-300' : 'text-zinc-300'}`}>
                {githubConnected ? 'GitHub connected' : 'Connect GitHub'}
              </span>
            </div>
          </button>
        </div>

        {!bothDone && (
          <p className="text-xs text-zinc-600">
            {resumeUploaded
              ? 'Almost there — connect GitHub to unlock your scores'
              : githubConnected
              ? 'Almost there — upload your resume to unlock your scores'
              : 'Complete both steps to unlock your verified skill score'}
          </p>
        )}
      </Card>

      <ResumeUploadModal
        open={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onConfirm={handleResumeConfirm}
      />

      <GitHubConnectModal
        open={githubModalOpen}
        onClose={() => { setGithubModalOpen(false); dismissGithubMismatch(); }}
        onConnectOAuth={handleGithubOAuth}
        onConnectManual={handleGithubManual}
        onConfirmMismatch={handleConfirmMismatch}
        mismatchEmail={githubEmailMismatch}
        userEmail={profile.email}
      />
    </>
  );
}

export function AnalyzingState() {
  return (
    <Card hover={false} gradient className="p-10 max-w-xl mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
      <h3 className="text-xl font-bold text-zinc-100 mb-2">Analyzing your profile...</h3>
      <p className="text-sm text-zinc-400 max-w-sm mx-auto">
        Cross-referencing your GitHub activity and resume against external skill benchmarks.
        This usually takes a few seconds.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span>Comparing repo complexity to industry benchmarks</span>
      </div>
    </Card>
  );
}
