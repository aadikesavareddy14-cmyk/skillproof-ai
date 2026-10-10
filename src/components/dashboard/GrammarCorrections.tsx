import { useState } from 'react';
import {
  Sparkles,
  Check,
  CheckCircle2,
  Undo2,
  ArrowRight,
  HelpCircle,
  FileCheck,
  X,
  Camera,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import type { GrammarCorrection, ResumeStructuredContent } from '@/lib/resumeData';
import {
  applySingleCorrection,
  revertSingleCorrection,
  applyAllCorrections,
} from '@/lib/grammarEngine';

interface GrammarCorrectionsProps {
  corrections: GrammarCorrection[];
  structuredContent: ResumeStructuredContent;
  onContentChange: (
    newContent: ResumeStructuredContent,
    newCorrections: GrammarCorrection[],
  ) => void;
  onProceedToPhoto?: () => void;
  onProceedToPreview?: () => void;
}

export function GrammarCorrections({
  corrections,
  structuredContent,
  onContentChange,
  onProceedToPhoto,
  onProceedToPreview,
}: GrammarCorrectionsProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const pendingCount = corrections.filter((c) => !c.applied && !c.rejected).length;
  const appliedCount = corrections.filter((c) => c.applied).length;
  const rejectedCount = corrections.filter((c) => c.rejected).length;

  const categories = ['all', ...Array.from(new Set(corrections.map((c) => c.category)))];

  const filteredCorrections =
    filterCategory === 'all'
      ? corrections
      : corrections.filter((c) => c.category === filterCategory);

  const handleApplySingle = (corr: GrammarCorrection) => {
    let baseContent = structuredContent;
    // If it was already applied, nothing to re-apply
    if (!corr.applied) {
      baseContent = applySingleCorrection(baseContent, corr);
    }
    const updatedCorrections = corrections.map((c) =>
      c.id === corr.id ? { ...c, applied: true, rejected: false } : c,
    );
    onContentChange(baseContent, updatedCorrections);
  };

  const handleRejectSingle = (corr: GrammarCorrection) => {
    let baseContent = structuredContent;
    // If it was previously applied, revert it
    if (corr.applied) {
      baseContent = revertSingleCorrection(baseContent, corr);
    }
    const updatedCorrections = corrections.map((c) =>
      c.id === corr.id ? { ...c, applied: false, rejected: true } : c,
    );
    onContentChange(baseContent, updatedCorrections);
  };

  const handleUndoSingle = (corr: GrammarCorrection) => {
    let baseContent = structuredContent;
    if (corr.applied) {
      baseContent = revertSingleCorrection(baseContent, corr);
    }
    const updatedCorrections = corrections.map((c) =>
      c.id === corr.id ? { ...c, applied: false, rejected: false } : c,
    );
    onContentChange(baseContent, updatedCorrections);
  };

  const handleApplyAll = () => {
    const { updatedContent, updatedCorrections } = applyAllCorrections(
      structuredContent,
      corrections,
    );
    const fullyUpdatedCorrections = updatedCorrections.map((c) => ({
      ...c,
      applied: true,
      rejected: false,
    }));
    onContentChange(updatedContent, fullyUpdatedCorrections);
  };

  const handleRejectAll = () => {
    // Revert all currently applied corrections
    let baseContent = structuredContent;
    corrections.forEach((c) => {
      if (c.applied) {
        baseContent = revertSingleCorrection(baseContent, c);
      }
    });
    const fullyUpdatedCorrections = corrections.map((c) => ({
      ...c,
      applied: false,
      rejected: true,
    }));
    onContentChange(baseContent, fullyUpdatedCorrections);
  };

  const renderHighlightedOriginal = (corr: GrammarCorrection) => {
    const parts = corr.originalSentence.split(corr.originalHighlight);
    if (parts.length < 2) {
      return (
        <span className="text-zinc-300">
          <span className="bg-red-500/20 text-red-300 line-through decoration-red-400 font-medium px-1 rounded border-b border-red-500/40">
            {corr.originalSentence}
          </span>
        </span>
      );
    }
    return (
      <span className="text-zinc-300 leading-relaxed text-xs">
        {parts[0]}
        <span className="bg-red-500/20 text-red-300 line-through decoration-red-400 font-medium px-1.5 py-0.5 rounded border-b border-red-500/40">
          {corr.originalHighlight}
        </span>
        {parts.slice(1).join(corr.originalHighlight)}
      </span>
    );
  };

  const renderHighlightedSuggested = (corr: GrammarCorrection) => {
    const parts = corr.suggestedSentence.split(corr.suggestedHighlight);
    if (parts.length < 2) {
      return (
        <span className="text-zinc-200">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-1.5 py-0.5 rounded border-b border-teal-500/40">
            {corr.suggestedSentence}
          </span>
        </span>
      );
    }
    return (
      <span className="text-zinc-200 leading-relaxed text-xs">
        {parts[0]}
        <span className="bg-teal-500/20 text-teal-300 font-semibold px-1.5 py-0.5 rounded border-b border-teal-500/40">
          {corr.suggestedHighlight}
        </span>
        {parts.slice(1).join(corr.suggestedHighlight)}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* Header bar */}
      <Card hover={false} className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-zinc-100">
                  Grammar & Phrasing Corrections
                </h3>
                {pendingCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {pendingCount} to review
                  </Badge>
                )}
                {appliedCount > 0 && (
                  <Badge variant="success" size="sm">
                    {appliedCount} applied
                  </Badge>
                )}
                {rejectedCount > 0 && (
                  <Badge variant="neutral" size="sm">
                    {rejectedCount} rejected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Refine weak action verbs, fix tense shifts, and eliminate passive voice. The PDF export uses only the improvements you accept.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {pendingCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleApplyAll}
                  className="press-scale flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/20 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply all ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="press-scale px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
                >
                  Reject all
                </button>
              </>
            )}

            {onProceedToPhoto && (
              <button
                type="button"
                onClick={onProceedToPhoto}
                className="press-scale flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                Add photo (Optional) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onProceedToPreview && (
              <button
                type="button"
                onClick={onProceedToPreview}
                className="press-scale flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview resume <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category filter pills */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-800/80 overflow-x-auto pb-1">
            <span className="text-[11px] font-medium text-zinc-500 shrink-0">Filter:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium transition-colors shrink-0 ${
                  filterCategory === cat
                    ? 'bg-zinc-700 text-white border border-zinc-600'
                    : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat === 'all' ? 'All Issues' : cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Positive empty state when no issues exist */}
      {corrections.length === 0 ? (
        <Card hover={false} gradient className="p-10 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-7 h-7 text-teal-400" />
          </div>
          <h4 className="text-base font-bold text-zinc-100 mb-1">
            No grammar issues found — your writing is clean.
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6">
            Your resume uses strong active verbs, proper technical casing, and consistent phrasing throughout your experience statements.
          </p>
          <div className="flex items-center justify-center gap-3">
            {onProceedToPhoto && (
              <button
                onClick={onProceedToPhoto}
                className="press-scale inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" /> Add Profile Photo
              </button>
            )}
            {onProceedToPreview && (
              <button
                onClick={onProceedToPreview}
                className="press-scale inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Corrected Resume <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </Card>
      ) : (
        /* Two-Column Comparison Cards */
        <div className="space-y-4">
          {filteredCorrections.map((corr) => (
            <div
              key={corr.id}
              className={`rounded-2xl border transition-all ${
                corr.applied
                  ? 'border-teal-500/30 bg-teal-950/10'
                  : corr.rejected
                  ? 'border-zinc-800/60 bg-zinc-950/40 opacity-70'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
              }`}
            >
              {/* Card Meta Top Bar */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      corr.category === 'passive-voice'
                        ? 'warning'
                        : corr.category === 'tense'
                        ? 'info'
                        : corr.category === 'spelling'
                        ? 'neutral'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {corr.categoryLabel}
                  </Badge>

                  {corr.sectionContext && (
                    <span className="text-[11px] text-zinc-500 font-medium">
                      in {corr.sectionContext}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {corr.applied ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Applied
                    </span>
                  ) : corr.rejected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                      <X className="w-3 h-3" /> Rejected
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Needs review
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Content Comparison */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Original with Highlight */}
                <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                    <span>Original Phrasing</span>
                    <span className="text-red-400 font-normal">Issues highlighted</span>
                  </div>
                  <div className="text-zinc-300">{renderHighlightedOriginal(corr)}</div>
                </div>

                {/* Right: Suggested with Highlight */}
                <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-950/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-teal-400 font-semibold uppercase tracking-wider">
                    <span>AI Improved Phrasing</span>
                    <span className="text-teal-400 font-normal">Action-oriented</span>
                  </div>
                  <div className="text-zinc-200">{renderHighlightedSuggested(corr)}</div>
                </div>
              </div>

              {/* Reason Explanation & Action Buttons */}
              <div className="px-5 pb-4 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/40">
                <div className="flex items-start gap-1.5 text-xs text-zinc-400 max-w-xl">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{corr.reason}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {corr.applied ? (
                    <button
                      type="button"
                      onClick={() => handleUndoSingle(corr)}
                      className="press-scale inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition-colors"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      Undo
                    </button>
                  ) : corr.rejected ? (
                    <button
                      type="button"
                      onClick={() => handleApplySingle(corr)}
                      className="press-scale inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply fix
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRejectSingle(corr)}
                        className="press-scale inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs font-medium transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplySingle(corr)}
                        className="press-scale inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply fix
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick confirmation banner if all applied or reviewed */}
          {pendingCount === 0 && (appliedCount > 0 || rejectedCount > 0) && (
            <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-slide">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    Review complete: {appliedCount} improvements accepted for export
                  </p>
                  <p className="text-xs text-zinc-400">
                    {rejectedCount > 0
                      ? `${rejectedCount} suggestions kept original. Your resume content is ready for preview.`
                      : 'Your resume text has been polished and is ready for preview & PDF download.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onProceedToPhoto && (
                  <button
                    type="button"
                    onClick={onProceedToPhoto}
                    className="press-scale px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
                  >
                    Add photo
                  </button>
                )}
                {onProceedToPreview && (
                  <button
                    type="button"
                    onClick={onProceedToPreview}
                    className="press-scale px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    Preview resume <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
