import { useState } from 'react';
import { CheckCircle2, Circle, FileText, Lock } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { ResumeUploadModal } from '@/components/dashboard/ResumeUploadModal';
import { useAuth } from '@/context/AuthContext';
import { SkillProofLogo } from '@/components/SkillProofLogo';
import { resumeStore } from '@/lib/resumeStore';

interface LockedStateProps {
  resumeUploaded: boolean;
  title?: string;
  message?: string;
}

export function LockedState({
  resumeUploaded,
  title = 'Your skill profile is locked',
  message = 'Upload your resume to unlock your verified skill score, job matches, and learning roadmap.',
}: LockedStateProps) {
  const { uploadResume } = useAuth();
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  const handleResumeConfirm = async (file: File) => {
    try {
      const parsedResume = await resumeStore.uploadAndParse(file);
      await uploadResume(
        parsedResume.fileName,
        parsedResume.fileSize,
        parsedResume.analysis.overallScore,
        null,
      );
    } catch {
      uploadResume(file.name, file.size);
    }
    setResumeModalOpen(false);
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
          {/* Single checklist item: Resume uploaded */}
          <button
            onClick={() => !resumeUploaded && setResumeModalOpen(true)}
            disabled={resumeUploaded}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-colors text-left ${
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
              <span className={`text-sm ${resumeUploaded ? 'text-teal-300 font-medium' : 'text-zinc-300 font-medium'}`}>
                {resumeUploaded ? 'Resume uploaded' : 'Upload your resume'}
              </span>
            </div>
          </button>
        </div>

        {!resumeUploaded && (
          <p className="text-xs text-zinc-500">
            Upload your resume to calculate your score and view personalized opportunities
          </p>
        )}
      </Card>

      <ResumeUploadModal
        open={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onConfirm={handleResumeConfirm}
      />
    </>
  );
}

export function AnalyzingState() {
  return (
    <Card hover={false} gradient className="p-10 max-w-xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <SkillProofLogo variant="full" size="md" layout="vertical" animated />
      </div>
      <h3 className="text-xl font-bold text-zinc-100 mb-2">Analyzing your resume...</h3>
      <p className="text-sm text-zinc-400 max-w-sm mx-auto">
        Extracting technical skills, experience metrics, and project evidence against role benchmarks.
        This usually takes a few seconds.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span>Evaluating skill statements, metrics, and section depth</span>
      </div>
    </Card>
  );
}
