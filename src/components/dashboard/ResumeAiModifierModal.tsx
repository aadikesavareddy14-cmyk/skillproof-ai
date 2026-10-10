import { useState } from 'react';
import {
  Sparkles,
  X,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import {
  modifyResumeWithAi,
  type TargetSection,
  type ModifyResumeResult,
} from '@/lib/resumeAiModifier';
import type { StoredResume } from '@/lib/resumeStore';

interface ResumeAiModifierModalProps {
  open: boolean;
  activeResume: StoredResume;
  onClose: () => void;
  onApplyModification: (result: ModifyResumeResult) => void;
}

export function ResumeAiModifierModal({
  open,
  activeResume,
  onClose,
  onApplyModification,
}: ResumeAiModifierModalProps) {
  const [instruction, setInstruction] = useState('');
  const [targetSection, setTargetSection] = useState<TargetSection>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<ModifyResumeResult | null>(null);

  if (!open) return null;

  const quickPrompts = [
    { label: 'Rewrite summary with metrics', section: 'summary' as TargetSection, prompt: 'Change my summary to highlight scalable cloud engineering and 3+ years of experience with concrete metrics.' },
    { label: 'Quantify experience bullets', section: 'experience' as TargetSection, prompt: 'Quantify bullet points in my work experience with percentages, latency reductions, and strong action verbs.' },
    { label: 'Add modern skills', section: 'skills' as TargetSection, prompt: 'Add skills: Docker, Kubernetes, GraphQL, and AWS to my technical skills.' },
    { label: 'Add a new project', section: 'projects' as TargetSection, prompt: 'Add this project: Distributed Log Pipeline — Go, Kafka, Docker — Processed 50k events/sec with automated failover.' },
  ];

  const handleGenerate = async () => {
    if (!instruction.trim()) {
      setError('Please provide an instruction or pick a quick prompt.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Simulate real AI processing latency for polish
      await new Promise((r) => setTimeout(r, 800));

      const result = await modifyResumeWithAi({
        activeResumeId: activeResume.id,
        originalContent: activeResume.content,
        instruction,
        targetSection,
      });

      if (!result.success) {
        setError(result.validationErrors?.[0] || 'Modification failed integrity validation.');
        setPreviewResult(null);
      } else {
        setPreviewResult(result);
      }
    } catch {
      setError('An error occurred while modifying the resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (previewResult) {
      onApplyModification(previewResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-100">Modify Resume with AI</h3>
                <Badge variant="info" size="sm">
                  Single Source of Truth
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Modifying only <span className="font-semibold text-zinc-200">{activeResume.fileName}</span>. All other details and sections are strictly preserved.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Target Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Target Section:
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { id: 'all', label: 'All Sections' },
                { id: 'summary', label: 'Summary' },
                { id: 'experience', label: 'Experience' },
                { id: 'projects', label: 'Projects' },
                { id: 'skills', label: 'Skills' },
                { id: 'contact', label: 'Contact' },
              ] as const
            ).map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setTargetSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  targetSection === sec.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-zinc-400">Quick suggestions:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInstruction(qp.prompt);
                  setTargetSection(qp.section);
                  setPreviewResult(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-[11px] text-zinc-300 hover:text-zinc-100 transition-colors text-left"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Instruction Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">
            Your Instructions to the AI:
          </label>
          <textarea
            value={instruction}
            onChange={(e) => {
              setInstruction(e.target.value);
              setPreviewResult(null);
            }}
            placeholder="e.g., 'Change my summary to highlight backend microservices' or 'Add this project: QuickPay in Flutter' or 'Quantify my bullet points'"
            rows={3}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Diff & Preview Card */}
        {previewResult && (
          <Card hover={false} className="p-4 border-teal-500/20 bg-teal-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-zinc-200">
                  Changes Ready for Review
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {previewResult.changedSections.map((sec) => (
                  <span
                    key={sec}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30"
                  >
                    {sec} modified
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-zinc-300 italic">{previewResult.changeSummary}</p>

            {/* Before vs After snippet for summary if changed */}
            {previewResult.changedSections.includes('Professional Summary') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                    Previous Summary
                  </span>
                  <p className="text-zinc-400 leading-relaxed line-through decoration-red-500/40">
                    {activeResume.content.summary || '(Empty summary)'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/90 border border-teal-500/30">
                  <span className="text-[10px] uppercase font-bold text-teal-400 block mb-1">
                    Updated Summary
                  </span>
                  <p className="text-teal-200 leading-relaxed font-medium">
                    {previewResult.modifiedContent.summary}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!previewResult ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !instruction.trim()}
                className="press-scale flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing & Modifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Modify Resume
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="press-scale flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/20 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Changes to Resume
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
