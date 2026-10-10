import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { useAuth } from '@/context/AuthContext';
import {
  defaultResumeAnalysis,
  type ResumeAnalysisData,
} from '@/lib/resumeData';
import { reScoreResume } from '@/lib/scoringService';

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

export function ResumeAnalysis() {
  const { profile, uploadResume } = useAuth();
  const [analysis, setAnalysis] = useState<ResumeAnalysisData>(() => ({
    ...defaultResumeAnalysis,
    fileName: profile.resumeFileName || defaultResumeAnalysis.fileName,
    overallScore: profile.resumeScore || defaultResumeAnalysis.overallScore,
    previousScore: profile.resumePreviousScore ?? defaultResumeAnalysis.previousScore,
    scoreDelta:
      profile.resumePreviousScore !== null && profile.resumePreviousScore !== undefined
        ? (profile.resumeScore || defaultResumeAnalysis.overallScore) - profile.resumePreviousScore
        : defaultResumeAnalysis.scoreDelta,
  }));

  const [uploading, setUploading] = useState(false);
  const [expandedScores, setExpandedScores] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
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
      // Re-run full analysis and calculate updated score
      const newAnalysis = reScoreResume(file.name, file.size, analysis.overallScore);
      setAnalysis(newAnalysis);
      await uploadResume(
        file.name,
        file.size,
        newAnalysis.overallScore,
        newAnalysis.previousScore,
      );
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  const toggleScore = (key: string) => {
    setExpandedScores((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const qualitativeVariant: Record<'Needs Work' | 'Good' | 'Strong', 'error' | 'warning' | 'success'> = {
    'Needs Work': 'error',
    Good: 'warning',
    Strong: 'success',
  };

  return (
    <div className="space-y-6">
      {/* Resume header card with replace action */}
      <Card hover={false} className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{analysis.fileName}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{formatSize(analysis.fileSize)}</span>
                <span>•</span>
                <span>Analyzed {analysis.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="press-scale flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/50 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Re-analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload new version
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </Card>

      {/* Overall Score + Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score Ring Card */}
        <Card hover={false} gradient className="p-8 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Overall Resume Score
            </span>
          </div>

          <ProgressRing
            value={analysis.overallScore}
            size={160}
            strokeWidth={10}
            label={`${analysis.overallScore}`}
            sublabel="/ 100"
          />

          <div className="mt-5 flex items-center gap-2">
            <Badge variant={qualitativeVariant[analysis.qualitativeLabel]} size="md">
              {analysis.qualitativeLabel}
            </Badge>

            {analysis.scoreDelta !== null && analysis.scoreDelta !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  analysis.scoreDelta > 0
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                {analysis.scoreDelta > 0 ? `+${analysis.scoreDelta}` : analysis.scoreDelta} pts since last upload
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 mt-4 max-w-xs leading-relaxed">
            Evaluated on statement clarity, quantifiable metrics, keywords, structure, and completeness.
          </p>
        </Card>

        {/* 5 Scoring Factors Card */}
        <Card hover={false} className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-zinc-200">Scoring Factors Breakdown</h3>
          </div>

          <div className="space-y-4">
            {analysis.factors.map((factor) => {
              const pct = Math.round((factor.score / factor.maxScore) * 100);
              return (
                <div key={factor.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">{factor.name}</span>
                    <span className="tabular-nums font-semibold text-zinc-200">
                      {factor.score}/{factor.maxScore} pts
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 85
                          ? 'bg-gradient-to-r from-blue-500 to-teal-400'
                          : pct >= 65
                          ? 'bg-gradient-to-r from-blue-500 to-amber-400'
                          : 'bg-gradient-to-r from-amber-500 to-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">{factor.description}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Concrete Improvement Suggestions */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-semibold text-zinc-200">Actionable Improvement Suggestions</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-5">
          Specific improvements generated from your resume content to increase your verified score
        </p>

        <div className="space-y-3">
          {analysis.suggestions.map((sug) => (
            <div
              key={sug.id}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-zinc-100">{sug.title}</span>
                  <Badge
                    variant={
                      sug.impact === 'High Impact'
                        ? 'warning'
                        : sug.impact === 'Medium Impact'
                        ? 'info'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {sug.impact}
                  </Badge>
                </div>
                <span className="text-xs font-semibold text-teal-400 shrink-0 tabular-nums">
                  {sug.scorePotential}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{sug.suggestion}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Extracted Skills Breakdown */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-teal-500" />
          <h3 className="text-base font-semibold text-zinc-200">Skills Extracted from Resume</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-5">
          Confidence levels grounded in supporting evidence, experience bullets, and project mentions
        </p>

        <div className="space-y-3">
          {analysis.skills.map((skill) => {
            const key = `skill-${skill.name}`;
            const expanded = expandedScores[key];
            const isListedOnly = skill.supportLevel === 'listed-only';

            return (
              <div
                key={skill.name}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
              >
                <button
                  onClick={() => toggleScore(key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-100">{skill.name}</span>
                      <Badge variant="neutral" size="sm">
                        {skill.level}
                      </Badge>
                      <Badge
                        variant={
                          skill.confidence >= 85
                            ? 'success'
                            : skill.confidence >= 65
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {skill.confidence}% confidence
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium ${
                          isListedOnly ? 'text-amber-400' : 'text-zinc-400'
                        }`}
                      >
                        {skill.supportLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-800/50 bg-zinc-950/30 space-y-3">
                    <p className="text-xs text-zinc-400 leading-relaxed mt-2">{skill.evidenceNote}</p>
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      <span className="text-[11px] text-zinc-500">Evidence source:</span>
                      {skill.sources.map((src) => (
                        <span
                          key={src}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
