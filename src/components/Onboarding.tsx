import { useState, useRef } from 'react';
import { FileText, ArrowRight, CheckCircle2, Loader2, AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SkillProofLogo } from '@/components/SkillProofLogo';

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
  const { profile, uploadResume } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isResumeUploaded = profile.resumeUploaded;

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

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
      <header className="border-b border-zinc-800/50 glass">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-16 flex items-center">
          <SkillProofLogo variant="lockup" size="navbar" />
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
              Let's set up your verified skill profile. Upload your resume so SkillProof AI can
              analyze your skills, calculate your score, and unlock job matches.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {/* Resume Card */}
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
              disabled={!isResumeUploaded}
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
