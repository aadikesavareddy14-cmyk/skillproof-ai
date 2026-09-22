import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Layers,
  FileCheck,
  Palette,
  Camera,
  Download,
  Maximize2,
  Minimize2,
  FileCode,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { useAuth } from '@/context/AuthContext';
import {
  getQualitativeVariant,
  type ResumeStructuredContent,
  type GrammarCorrection,
} from '@/lib/resumeData';
import { RESUME_TEMPLATES, type ResumeTemplateMeta } from '@/lib/resumeTemplatesData';
import { useResumeStore } from '@/lib/resumeStore';
import { GrammarCorrections } from './GrammarCorrections';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';
import { TemplateGallery } from './TemplateGallery';
import { ResumeLivePreview } from './ResumeLivePreview';
import { ResumeAiModifierModal } from './ResumeAiModifierModal';
import { ResumePasteModal } from './ResumePasteModal';
import type { ModifyResumeResult } from '@/lib/resumeAiModifier';

type FlowStage = 'rubric' | 'grammar' | 'photo' | 'templates' | 'preview';

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
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

export function ResumeAnalysis() {
  const { profile, uploadResume } = useAuth();
  const {
    resumes,
    selectedResumeId,
    activeResume,
    selectResume,
    updateActiveContent,
    uploadAndParse,
    pasteAndParse,
    deleteResume,
  } = useResumeStore();

  // Active stage in the guided lifecycle
  const [activeStage, setActiveStage] = useState<FlowStage>('rubric');

  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateMeta>(
    () => RESUME_TEMPLATES[0],
  );

  // UI accordion expand states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modifierOpen, setModifierOpen] = useState(false);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active resume to AuthContext profile state if needed
  useEffect(() => {
    if (activeResume) {
      if (!profile.resumeUploaded || profile.resumeFileName !== activeResume.fileName) {
        uploadResume(
          activeResume.fileName,
          activeResume.fileSize,
          activeResume.analysis.overallScore,
          activeResume.analysis.previousScore,
        );
      }
    }
  }, [activeResume, profile.resumeUploaded, profile.resumeFileName, uploadResume]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllSections = () => {
    if (!activeResume) return;
    const allExpanded: Record<string, boolean> = {};
    activeResume.analysis.rubricSections.forEach((s) => {
      allExpanded[s.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAllSections = () => {
    setExpandedSections({});
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedType(file)) {
      setError('Please upload a PDF, Word document, or text file (.pdf, .docx, .txt)');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File is too large — maximum 5MB');
      return;
    }

    setUploading(true);
    try {
      const parsedResume = await uploadAndParse(file);
      await uploadResume(
        parsedResume.fileName,
        parsedResume.fileSize,
        parsedResume.analysis.overallScore,
        null,
      );
    } catch {
      setError('Failed to process and parse resume. Please try pasting the text instead.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteConfirm = (rawText: string, title: string) => {
    const parsedResume = pasteAndParse(rawText, title);
    uploadResume(
      parsedResume.fileName,
      parsedResume.fileSize,
      parsedResume.analysis.overallScore,
      null,
    );
  };

  const handleApplyAiModification = (result: ModifyResumeResult) => {
    const updated = updateActiveContent(result.modifiedContent, result.changeSummary);
    if (updated) {
      uploadResume(
        updated.fileName,
        updated.fileSize,
        updated.analysis.overallScore,
        activeResume?.analysis.overallScore ?? null,
      );
    }
  };

  const handleGrammarContentChange = (
    newContent: ResumeStructuredContent,
    _newCorrections: GrammarCorrection[],
  ) => {
    updateActiveContent(newContent, 'Applied grammar corrections');
  };

  // --------------------------------------------------------------------------
  // EMPTY STATE: When no resume is uploaded or selected
  // Requirement: "If no resume has been selected or uploaded, do not generate a random resume. Instead display: 'Please upload or select a resume to continue.'"
  // --------------------------------------------------------------------------
  if (!activeResume) {
    return (
      <div className="space-y-6 animate-fade-slide">
        <Card hover={false} gradient className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Please upload or select a resume to continue.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Upload your actual resume (PDF, Word, or text file) or paste its text directly. We evaluate your real experience, skills, and projects against our 100-point rubric without generating fictional candidates or random data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="press-scale w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Resume File (.pdf, .docx, .txt)
                </>
              )}
            </button>

            <button
              onClick={() => setPasteModalOpen(true)}
              className="press-scale w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors"
            >
              <FileCode className="w-4 h-4 text-teal-400" />
              Paste Resume Text
            </button>
          </div>

          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </Card>

        {/* Text Paste Modal */}
        <ResumePasteModal
          open={pasteModalOpen}
          onClose={() => setPasteModalOpen(false)}
          onConfirm={handlePasteConfirm}
        />
      </div>
    );
  }

  // Active resume data from single source of truth
  const analysis = activeResume.analysis;
  const structuredContent = activeResume.content;
  const grammarCorrections = analysis.grammarCorrections;

  const allSectionsAreExpanded =
    analysis.rubricSections.length > 0 &&
    analysis.rubricSections.every((s) => expandedSections[s.id]);

  const qualitativeLabel = analysis.qualitativeLabel;
  const qualitativeVariant = getQualitativeVariant(qualitativeLabel);

  return (
    <div className="space-y-6">
      {/* Resume File Meta Card & Single Source of Truth Switcher */}
      <Card hover={false} className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Resume Selector if multiple resumes exist */}
                {resumes.length > 1 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-500 font-medium">Active:</span>
                    <select
                      value={selectedResumeId || activeResume.id}
                      onChange={(e) => selectResume(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.fileName} ({r.analysis.overallScore} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-zinc-200">{activeResume.fileName}</p>
                )}

                <Badge variant={qualitativeVariant} size="sm">
                  {analysis.overallScore}/100 • {qualitativeLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                <span>{formatSize(activeResume.fileSize)}</span>
                <span>•</span>
                <span>Candidate: {structuredContent.name || 'Provided Resume'}</span>
                <span>•</span>
                <span>Added {activeResume.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action: Modify with AI */}
            <button
              type="button"
              onClick={() => setModifierOpen(true)}
              className="press-scale flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Modify with AI
            </button>

            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="press-scale flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload new version
                </>
              )}
            </button>

            <button
              onClick={() => setPasteModalOpen(true)}
              className="press-scale p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-colors"
              title="Paste text version"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>

            {resumes.length > 1 && (
              <button
                onClick={() => deleteResume(activeResume.id)}
                className="press-scale p-2 rounded-xl bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-700/60 transition-colors"
                title="Remove this resume"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </Card>

      {/* Guided Lifecycle Stepper / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'rubric', label: '1. Score & Rubric Breakdown', icon: Sparkles },
          {
            id: 'grammar',
            label: `2. Grammar Corrections (${
              grammarCorrections.filter((c) => !c.applied).length > 0
                ? `${grammarCorrections.filter((c) => !c.applied).length} pending`
                : 'Clean'
            })`,
            icon: FileCheck,
          },
          { id: 'photo', label: '3. Profile Photo (Optional)', icon: Camera },
          { id: 'templates', label: '4. Choose Template (10 Styles)', icon: Palette },
          { id: 'preview', label: '5. Preview & Download PDF', icon: Download },
        ].map((tab) => {
          const isActive = activeStage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStage(tab.id as FlowStage)}
              className={`press-scale flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: 100-POINT SCORE & SECTION BREAKDOWN                              */}
      {/* ========================================================================= */}
      {activeStage === 'rubric' && (
        <div className="space-y-6 animate-fade-slide">
          {/* Top Row: Overall Score Ring + Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Score Ring Card */}
            <Card hover={false} gradient className="p-8 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Overall 100-Pt Score
                </span>
              </div>

              <ProgressRing
                value={analysis.overallScore}
                size={160}
                strokeWidth={10}
                label={`${analysis.overallScore}`}
                sublabel="/ 100"
              />

              <div className="mt-5 flex items-center gap-2 flex-wrap justify-center">
                <Badge variant={qualitativeVariant} size="md">
                  {qualitativeLabel}
                </Badge>

                {analysis.scoreDelta !== null && analysis.scoreDelta !== undefined && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      analysis.scoreDelta > 0
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : analysis.scoreDelta < 0
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {analysis.scoreDelta > 0 ? `+${analysis.scoreDelta}` : analysis.scoreDelta} pts
                    vs last upload
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 mt-4 max-w-xs leading-relaxed">
                Evaluated against the 100-point rubric across 8 categories with content-specific
                recommendations for <span className="font-semibold text-zinc-200">{activeResume.fileName}</span>.
              </p>
            </Card>

            {/* Rubric Category Overview Progress Bars */}
            <Card hover={false} className="p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-semibold text-zinc-200">
                      8-Category Rubric Overview
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">100 Points Total</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {analysis.rubricSections.map((sec) => {
                    const pct = Math.round((sec.score / sec.maxScore) * 100);
                    return (
                      <div key={sec.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-300 truncate">{sec.name}</span>
                          <span className="tabular-nums font-semibold text-zinc-200 shrink-0">
                            {sec.score}/{sec.maxScore}
                            {sec.scoreDelta !== undefined && sec.scoreDelta !== 0 && (
                              <span
                                className={`ml-1 text-[11px] ${
                                  sec.scoreDelta > 0 ? 'text-teal-400' : 'text-red-400'
                                }`}
                              >
                                ({sec.scoreDelta > 0 ? `+${sec.scoreDelta}` : sec.scoreDelta})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 80
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                                : pct >= 60
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-red-500 to-rose-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick-Action */}
              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  Ready to polish writing quality?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStage('grammar')}
                  className="press-scale inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Review grammar corrections <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          </div>

          {/* ========================================================================= */}
          {/* WEAKEST SECTIONS (PRIORITY FIX LIST) PINNED AT TOP                        */}
          {/* ========================================================================= */}
          {analysis.priorityFixes.length > 0 && (
            <Card hover={false} className="p-6 border-amber-500/20 bg-amber-950/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-semibold text-zinc-100">
                    Fix These First (Priority Action List)
                  </h3>
                </div>
                <Badge variant="warning" size="sm">
                  Top {analysis.priorityFixes.length} Focus Areas
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                These categories currently have the lowest score percentage in your resume. Focus your effort here
                first to achieve the highest score increase.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.priorityFixes.map((fix) => (
                  <div
                    key={fix.categoryId}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-200">{fix.categoryName}</span>
                        <span className="text-xs font-mono font-semibold text-amber-400">
                          {fix.currentScore}/{fix.maxScore} pts
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{fix.primaryFix}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <span className="text-[11px] text-teal-400 font-semibold">
                        +{fix.scoreGap} pts potential
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedSections((prev) => ({ ...prev, [fix.categoryId]: true }));
                          const el = document.getElementById(`section-${fix.categoryId}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        View details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* SECTION-BY-SECTION BREAKDOWN (EXPANDABLE CARDS)                           */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-semibold text-zinc-100">
                  Section-by-Section Scoring Rubric Breakdown
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={allSectionsAreExpanded ? collapseAllSections : expandAllSections}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 transition-colors"
                >
                  {allSectionsAreExpanded ? (
                    <>
                      <Minimize2 className="w-3 h-3" /> Collapse all
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3" /> Expand all
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {analysis.rubricSections.map((section) => {
                const isExpanded = expandedSections[section.id];
                const pct = Math.round((section.score / section.maxScore) * 100);

                const statusColor =
                  section.status === 'strong'
                    ? 'text-teal-400 bg-teal-500/10 border-teal-500/20'
                    : section.status === 'moderate'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20';

                return (
                  <div
                    key={section.id}
                    id={`section-${section.id}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700/80 transition-all overflow-hidden"
                  >
                    {/* Collapsed Header Bar */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/60 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-base font-bold text-zinc-100">{section.name}</span>

                          {/* Score Ratio (e.g. 14/25 pts) */}
                          <span className="text-xs font-mono font-bold text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                            {section.score}/{section.maxScore} pts
                          </span>

                          {/* Re-score delta display */}
                          {section.previousScore !== undefined && (
                            <span className="text-xs font-mono text-zinc-400">
                              ({section.previousScore} → {section.score}
                              {section.scoreDelta !== undefined && (
                                <span
                                  className={`ml-1 font-semibold ${
                                    section.scoreDelta > 0 ? 'text-teal-400' : 'text-red-400'
                                  }`}
                                >
                                  {section.scoreDelta > 0
                                    ? `+${section.scoreDelta}`
                                    : section.scoreDelta}
                                </span>
                              )}
                              )
                            </span>
                          )}

                          {/* Color coded status badge */}
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}
                          >
                            {section.statusLabel}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 max-w-md rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 80
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                                : pct >= 60
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-red-500 to-rose-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Content with actionable suggestions */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-zinc-800/60 bg-zinc-950/40 space-y-3 animate-fade-slide">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Specific Content Analysis & Required Fixes:
                        </p>
                        <div className="space-y-2">
                          {section.suggestions.map((sug, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 text-xs text-zinc-300 leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                              <span>{sug}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SKILLS TO IMPROVE (SEPARATE DISTINCT SECTION)                             */}
          {/* ========================================================================= */}
          {analysis.skillsToImprove.length > 0 && (
            <Card hover={false} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-semibold text-zinc-100">Skills to Improve</h3>
                </div>
                <span className="text-xs text-zinc-500 font-mono">Forward-looking gap analysis</span>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                Identifies skills claimed without supporting evidence and high-demand competencies
                expected for your target role.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.skillsToImprove.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      item.type === 'ungrounded'
                        ? 'border-amber-900/40 bg-amber-950/10'
                        : 'border-blue-900/40 bg-blue-950/10'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-100">{item.name}</span>
                        <Badge
                          variant={item.type === 'ungrounded' ? 'warning' : 'info'}
                          size="sm"
                        >
                          {item.typeLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{item.reason}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 text-xs">
                      <span className="font-semibold text-zinc-200">Recommended Action:</span>
                      <p className="text-zinc-400 mt-0.5 leading-relaxed">{item.suggestedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Extracted Skills Breakdown with Evidence Grounding */}
          {analysis.skills.length > 0 && (
            <Card hover={false} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-semibold text-zinc-100">
                    Extracted Skills & Evidence Grounding
                  </h3>
                </div>
                <span className="text-xs text-zinc-500">Confidence based on project & work history</span>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                Skills extracted directly from your resume with corroborating source bullet counts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-100">{skill.name}</span>
                        <Badge variant="neutral" size="sm">
                          {skill.level}
                        </Badge>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-zinc-200">
                        {skill.confidence}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          skill.confidence >= 85
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                            : skill.confidence >= 65
                            ? 'bg-gradient-to-r from-blue-500 to-amber-400'
                            : 'bg-gradient-to-r from-amber-500 to-red-500'
                        }`}
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>

                    <p className="text-xs text-zinc-400 leading-snug">{skill.supportLabel}</p>

                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      {skill.sources.map((src) => (
                        <span
                          key={src}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: GRAMMAR & WRITING CORRECTIONS (DEDICATED COLUMN/SECTION)          */}
      {/* ========================================================================= */}
      {activeStage === 'grammar' && (
        <GrammarCorrections
          corrections={grammarCorrections}
          structuredContent={structuredContent}
          onContentChange={handleGrammarContentChange}
          onProceedToTemplates={() => setActiveStage('photo')}
        />
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: PROFILE PHOTO UPLOAD (OPTIONAL)                                  */}
      {/* ========================================================================= */}
      {activeStage === 'photo' && (
        <Card hover={false} gradient className="p-8 max-w-2xl mx-auto space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Add a Profile Photo</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Optional step. Many modern engineering and creative templates include a circular
                avatar photo. Upload and position your photo below.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex justify-center">
            <ProfilePhotoUploader size="lg" showDetails={true} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveStage('grammar')}
              className="text-xs text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
            >
              ← Back to Grammar
            </button>
            <button
              type="button"
              onClick={() => setActiveStage('templates')}
              className="press-scale flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              Continue to Template Gallery <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: RESUME TEMPLATE GALLERY                                          */}
      {/* ========================================================================= */}
      {activeStage === 'templates' && (
        <TemplateGallery
          selectedTemplateId={selectedTemplate.id}
          onSelectTemplate={setSelectedTemplate}
          onContinueToPreview={(tpl) => {
            setSelectedTemplate(tpl);
            setActiveStage('preview');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* STAGE 5: LIVE RESUME PREVIEW & PDF DOWNLOAD                               */}
      {/* ========================================================================= */}
      {activeStage === 'preview' && (
        <ResumeLivePreview
          template={selectedTemplate}
          content={structuredContent}
          onBackToGallery={() => setActiveStage('templates')}
          onModifyWithAi={() => setModifierOpen(true)}
        />
      )}

      {/* AI Resume Modifier Modal */}
      <ResumeAiModifierModal
        open={modifierOpen}
        activeResume={activeResume}
        onClose={() => setModifierOpen(false)}
        onApplyModification={handleApplyAiModification}
      />

      {/* Text Paste Modal */}
      <ResumePasteModal
        open={pasteModalOpen}
        onClose={() => setPasteModalOpen(false)}
        onConfirm={handlePasteConfirm}
      />
    </div>
  );
}
