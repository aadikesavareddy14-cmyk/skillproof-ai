import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, TrendingDown, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { resumeAnalysis } from '@/lib/resumeData';
import { useAuth } from '@/context/AuthContext';

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx'];
const MAX_SIZE = 5 * 1024 * 1024;

function isAcceptedType(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_TYPES.some((ext) => name.endsWith(ext));
}

export function ResumeAnalysis() {
  const { uploadResume } = useAuth();
  const [hasResume, setHasResume] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedScores, setExpandedScores] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedType(file)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File is too large — maximum 5MB');
      return;
    }

    setUploading(true);
    setTimeout(async () => {
      await uploadResume(file.name, file.size);
      setUploading(false);
      setHasResume(true);
    }, 1500);
  };

  const toggleScore = (key: string) => {
    setExpandedScores((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!hasResume) {
    return (
      <Card hover={false} className="p-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-5">
            <Upload className="w-7 h-7 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Upload your resume</h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-6">
            Upload a PDF resume and SkillProof AI will analyze it alongside your GitHub
            activity to build a complete picture of your skills.
          </p>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="press-scale flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Analyzing...' : 'Upload resume (PDF)'}
          </button>
          {error && (
            <p className="mt-3 text-xs text-red-400">{error}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume header */}
      <Card hover={false} className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{resumeAnalysis.fileName}</p>
              <p className="text-xs text-zinc-500">Uploaded {resumeAnalysis.uploadedAt}</p>
            </div>
          </div>
          <button
            onClick={() => setHasResume(false)}
            className="press-scale flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-600 text-zinc-400 text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Replace
          </button>
        </div>
      </Card>

      {/* Skills you have */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle2 className="w-5 h-5 text-teal-500" />
          <h3 className="text-base font-semibold text-zinc-200">Skills you currently have</h3>
        </div>
        <div className="space-y-4">
          {resumeAnalysis.skillsYouHave.map((skill) => {
            const key = `have-${skill.name}`;
            const expanded = expandedScores[key];
            return (
              <div key={skill.name} className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <button
                  onClick={() => toggleScore(key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-100">{skill.name}</span>
                      <div className="flex gap-1">
                        {skill.sources.map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{s}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{skill.evidenceNote}</p>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 pt-1">
                    <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/50">
                      <span className="text-xs text-zinc-500">Detailed score:</span>
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden max-w-[200px]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 bar-fill"
                          style={{ width: '0%' }}
                          ref={(el) => { if (el) setTimeout(() => { el.style.width = `${skill.confidence}%`; }, 100); }}
                        />
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-zinc-300">{skill.confidence}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Skills to improve */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-zinc-200">Skills you should improve</h3>
        </div>
        <div className="space-y-4">
          {resumeAnalysis.skillsToImprove.map((skill) => {
            const key = `improve-${skill.name}`;
            const expanded = expandedScores[key];
            return (
              <div key={skill.name} className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <button
                  onClick={() => toggleScore(key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">{skill.name}</span>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1">{skill.note}</p>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 pt-1">
                    <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/50">
                      <span className="text-xs text-zinc-500">Detailed score:</span>
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden max-w-[200px]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 bar-fill"
                          style={{ width: '0%' }}
                          ref={(el) => { if (el) setTimeout(() => { el.style.width = `${skill.confidence}%`; }, 100); }}
                        />
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-zinc-300">{skill.confidence}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Where you're lagging */}
      <Card hover={false} gradient className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-zinc-200">Where you're lagging</h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {resumeAnalysis.laggingNarrative}
        </p>
      </Card>
    </div>
  );
}
