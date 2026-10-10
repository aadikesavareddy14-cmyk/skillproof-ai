import { useState } from 'react';
import {
  Sparkles,
  Check,
  CheckCircle2,
  Undo2,
  ArrowRight,
  HelpCircle,
  FileCheck,
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
  onProceedToTemplates?: () => void;
}

export function GrammarCorrections({
  corrections,
  structuredContent,
  onContentChange,
  onProceedToTemplates,
}: GrammarCorrectionsProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const pendingCount = corrections.filter((c) => !c.applied).length;
  const appliedCount = corrections.filter((c) => c.applied).length;

  const categories = ['all', ...Array.from(new Set(corrections.map((c) => c.category)))];

  const filteredCorrections =
    filterCategory === 'all'
      ? corrections
      : corrections.filter((c) => c.category === filterCategory);

  const handleApplySingle = (corr: GrammarCorrection) => {
    const updatedContent = applySingleCorrection(structuredContent, corr);
    const updatedCorrections = corrections.map((c) =>
      c.id === corr.id ? { ...c, applied: true } : c,
    );
    onContentChange(updatedContent, updatedCorrections);
  };

  const handleRevertSingle = (corr: GrammarCorrection) => {
    const updatedContent = revertSingleCorrection(structuredContent, corr);
    const updatedCorrections = corrections.map((c) =>
      c.id === corr.id ? { ...c, applied: false } : c,
    );
    onContentChange(updatedContent, updatedCorrections);
  };

  const handleApplyAll = () => {
    const { updatedContent, updatedCorrections } = applyAllCorrections(
      structuredContent,
      corrections,
    );
    onContentChange(updatedContent, updatedCorrections);
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
                  Grammar & Writing Corrections
                </h3>
                {pendingCount > 0 ? (
                  <Badge variant="warning" size="sm">
                    {pendingCount} to review
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    All applied ({appliedCount})
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Side-by-side phrasing refinements to eliminate passive voice, awkward phrasing,
                and technical casing issues.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleApplyAll}
                className="press-scale flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply all corrections ({pendingCount})
              </button>
            )}

            {onProceedToTemplates && (
              <button
                type="button"
                onClick={onProceedToTemplates}
                className="press-scale flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                Choose Template <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Positive empty state when no issues remain */}
      {corrections.length === 0 || (pendingCount === 0 && appliedCount === 0) ? (
        <Card hover={false} gradient className="p-10 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-7 h-7 text-teal-400" />
          </div>
          <h4 className="text-base font-bold text-zinc-100 mb-1">
            No grammar issues found — your writing is clean.
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6">
            Your resume uses strong active verbs, proper technical casing, and consistent past tense
            throughout your experience statements.
          </p>
          {onProceedToTemplates && (
            <button
              onClick={onProceedToTemplates}
              className="press-scale inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Choose a professional template <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                      <Check className="w-3 h-3" /> Applied to resume
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium">Pending review</span>
                  )}
                </div>
              </div>

              {/* Two-Column Comparison */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Original */}
                <div className="p-4 rounded-xl border border-red-900/30 bg-red-950/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                      Original
                    </span>
                  </div>
                  <div className="pt-1">{renderHighlightedOriginal(corr)}</div>
                </div>

                {/* Right Column: Suggested */}
                <div className="p-4 rounded-xl border border-teal-900/30 bg-teal-950/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                      Suggested Fix
                    </span>
                  </div>
                  <div className="pt-1">{renderHighlightedSuggested(corr)}</div>
                </div>
              </div>

              {/* Bottom Footer: One-line reason & action button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-t border-zinc-800/60 bg-zinc-950/40 rounded-b-2xl">
                <div className="flex items-start gap-2 max-w-xl">
                  <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400 leading-snug">{corr.reason}</p>
                </div>

                <div className="shrink-0">
                  {corr.applied ? (
                    <button
                      type="button"
                      onClick={() => handleRevertSingle(corr)}
                      className="press-scale inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
                    >
                      <Undo2 className="w-3 h-3" />
                      Undo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplySingle(corr)}
                      className="press-scale inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply fix
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick confirmation banner if all applied */}
          {pendingCount === 0 && appliedCount > 0 && (
            <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-slide">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    All {appliedCount} corrections applied to your resume
                  </p>
                  <p className="text-xs text-zinc-400">
                    Your resume text has been polished and is ready for template selection.
                  </p>
                </div>
              </div>
              {onProceedToTemplates && (
                <button
                  type="button"
                  onClick={onProceedToTemplates}
                  className="press-scale px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
                >
                  Proceed to Templates <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
