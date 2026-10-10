import { useState, useEffect } from 'react';
import {
  Download,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Sparkles,
  Camera,
  CheckCircle2,
  SplitSquareVertical,
  ArrowLeft,
  Info,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import type {
  ResumeStructuredContent,
  GrammarCorrection,
} from '@/lib/resumeData';
import { downloadAtsResumePdf } from '@/lib/pdfGenerator';

interface ResumeLivePreviewProps {
  content: ResumeStructuredContent;
  originalContent: ResumeStructuredContent;
  rawText?: string;
  fileName?: string;
  onModifyWithAi?: () => void;
  onBackToGrammar?: () => void;
  appliedCorrectionsCount?: number;
  corrections?: GrammarCorrection[];
}

export function ResumeLivePreview({
  content,
  originalContent,
  rawText,
  fileName,
  onModifyWithAi,
  onBackToGrammar,
  appliedCorrectionsCount = 0,
  corrections = [],
}: ResumeLivePreviewProps) {
  const { profile } = useAuth();
  const avatar = profile.avatarUrl;

  // View mode: 'corrected' (default) | 'original' | 'compare'
  const [viewMode, setViewMode] = useState<'corrected' | 'original' | 'compare'>('corrected');

  // Include photo toggle: defaults to ON only if a photo was added
  const [includePhoto, setIncludePhoto] = useState<boolean>(() => Boolean(avatar));

  // Highlight changes toggle in preview
  const [highlightChanges, setHighlightChanges] = useState(false);

  // Download notification toast
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const candidateName = (content.name || originalContent.name || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  const pdfFileName = `${candidateName}_Resume_Corrected.pdf`;

  // Update photo toggle if avatar changes
  useEffect(() => {
    if (avatar) {
      setIncludePhoto(true);
    }
  }, [avatar]);

  const [downloading, setDownloading] = useState(false);

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setDownloading(true);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);

    try {
      await downloadAtsResumePdf(content, {
        includePhoto,
        avatarUrl: avatar,
      });
    } catch (err) {
      console.warn('Direct PDF download failed, falling back to browser print:', err);
      const previousTitle = document.title;
      document.title = `${candidateName}_Resume_Corrected`;
      window.print();
      document.title = previousTitle;
    } finally {
      setDownloading(false);
    }
  };

  // Handle downloading untouched original resume
  const handleDownloadOriginal = () => {
    const originalText =
      rawText ||
      [
        originalContent.name,
        originalContent.title,
        [originalContent.email, originalContent.phone, originalContent.location]
          .filter(Boolean)
          .join(' | '),
        originalContent.linkedin,
        originalContent.github,
        '',
        'SUMMARY',
        originalContent.summary,
        '',
        'EXPERIENCE',
        ...(originalContent.experience || []).map(
          (e) => `${e.role} | ${e.company} (${e.period})\n${e.bullets.map((b) => `• ${b}`).join('\n')}`,
        ),
        ...(originalContent.internships || []).map(
          (e) => `[Internship] ${e.role} | ${e.company} (${e.period})\n${e.bullets.map((b) => `• ${b}`).join('\n')}`,
        ),
        '',
        'PROJECTS',
        ...(originalContent.projects || []).map(
          (p) => `${p.title} (${p.technologies.join(', ')})\n${p.bullets.map((b) => `• ${b}`).join('\n')}`,
        ),
        '',
        'SKILLS',
        `Languages: ${originalContent.skills.languages?.join(', ') || ''}`,
        `Frameworks: ${originalContent.skills.frameworks?.join(', ') || ''}`,
        `Databases: ${originalContent.skills.databases?.join(', ') || ''}`,
        `Tools: ${originalContent.skills.tools?.join(', ') || ''}`,
        '',
        'EDUCATION',
        ...(originalContent.education || []).map(
          (ed) => `${ed.degree} | ${ed.institution} (${ed.graduationDate})`,
        ),
      ].join('\n');

    const downloadName = fileName
      ? fileName.endsWith('.txt') || fileName.endsWith('.pdf')
        ? fileName
        : `${fileName}.txt`
      : `${candidateName}_Resume_Original.txt`;

    const blob = new Blob([originalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasPhoto = Boolean(avatar);

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* Top Toolbar / Action Bar */}
      <Card hover={false} className="p-4 sm:p-5 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: View Mode Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-zinc-900 border border-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setViewMode('corrected')}
                className={`press-scale px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'corrected'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Corrected Resume
              </button>
              <button
                type="button"
                onClick={() => setViewMode('original')}
                className={`press-scale px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'original'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                View Original
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`press-scale px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'compare'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                Original vs Corrected
              </button>
            </div>

            {/* Toggle Highlight AI Changes */}
            {viewMode !== 'original' && (
              <button
                type="button"
                onClick={() => setHighlightChanges(!highlightChanges)}
                className={`press-scale px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  highlightChanges
                    ? 'bg-teal-950/40 border-teal-500/40 text-teal-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {highlightChanges ? '✓ Changes highlighted' : 'Highlight changes'}
              </button>
            )}

            {/* Photo Toggle */}
            {hasPhoto && (
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 cursor-pointer select-none hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={includePhoto}
                  onChange={(e) => setIncludePhoto(e.target.checked)}
                  className="rounded border-zinc-700 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-zinc-800 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  Include photo
                </span>
              </label>
            )}
          </div>

          {/* Right: Actions & Primary PDF Download */}
          <div className="flex items-center gap-3 flex-wrap">
            {onBackToGrammar && (
              <button
                type="button"
                onClick={onBackToGrammar}
                className="text-xs text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Review grammar
              </button>
            )}

            {onModifyWithAi && (
              <button
                type="button"
                onClick={onModifyWithAi}
                className="press-scale flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-blue-400 border border-zinc-700 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Modify with AI
              </button>
            )}

            {/* Untouched Original Download Link */}
            <button
              type="button"
              onClick={handleDownloadOriginal}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline font-medium transition-colors"
              title="Download untouched original upload"
            >
              Download original resume
            </button>

            {/* Single Download Corrected Resume (PDF) Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="press-scale flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all shrink-0 disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download corrected resume (PDF)
                </>
              )}
            </button>
          </div>
        </div>

        {/* ATS Guidance Banner & Filename Notice */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-300">Output:</span>
            <span className="font-mono text-blue-400">{pdfFileName}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Single-column • ATS-optimized • Selectable text
            </span>
            {appliedCorrectionsCount > 0 && (
              <Badge variant="success" size="sm">
                {appliedCorrectionsCount} AI improvements applied
              </Badge>
            )}
          </div>

          {hasPhoto && includePhoto && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Note: Photos are often discouraged for automated ATS parsing.</span>
            </div>
          )}
        </div>
      </Card>

      {/* Download Success Confirmation Toast */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-xl border border-teal-500/40 bg-teal-950/30 text-teal-200 text-xs flex items-center gap-2 animate-fade-slide print:hidden">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Preparing <strong>{pdfFileName}</strong> for PDF download. In your print/save dialog, destination defaults to <em>Save as PDF</em> with full selectable text.
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESUME VIEWPORT: SINGLE SHEET OR SIDE-BY-SIDE COMPARE                      */}
      {/* ========================================================================= */}
      {viewMode === 'compare' ? (
        /* Side-by-Side: Original vs Corrected View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original Sheet */}
            <div className="space-y-2 print:hidden">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Original Resume (Untouched)
                </span>
                <Badge variant="neutral" size="sm">Original Upload</Badge>
              </div>
              <div className="bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
                <ResumeSheet
                  content={originalContent}
                  includePhoto={false}
                  avatar={null}
                  isOriginal={true}
                  highlightChanges={false}
                />
              </div>
            </div>

            {/* Right: Corrected Sheet (Print Target) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 print:hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Corrected Resume (AI Polished)
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    {appliedCorrectionsCount} changes accepted
                  </Badge>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
              <div className="bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
                <ResumeSheet
                  id="resume-printable-sheet"
                  content={content}
                  includePhoto={includePhoto}
                  avatar={avatar}
                  isOriginal={false}
                  highlightChanges={highlightChanges}
                  corrections={corrections}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Single Resume Sheet (Corrected or Original) */
        <div className="flex justify-center overflow-x-auto py-2">
          <div className="w-full max-w-[850px] bg-white text-zinc-900 shadow-2xl rounded-2xl overflow-hidden border border-zinc-200">
            <ResumeSheet
              id="resume-printable-sheet"
              content={viewMode === 'original' ? originalContent : content}
              includePhoto={viewMode === 'original' ? false : includePhoto}
              avatar={viewMode === 'original' ? null : avatar}
              isOriginal={viewMode === 'original'}
              highlightChanges={viewMode === 'corrected' && highlightChanges}
              corrections={corrections}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Single-Column Clean ATS Resume Document Sheet
// Pure selectable HTML text, standard fonts, consistent spacing, ATS headers
// ============================================================================
interface ResumeSheetProps {
  id?: string;
  content: ResumeStructuredContent;
  includePhoto: boolean;
  avatar: string | null;
  isOriginal: boolean;
  highlightChanges?: boolean;
  corrections?: GrammarCorrection[];
}

function ResumeSheet({
  id,
  content,
  includePhoto,
  avatar,
  isOriginal: _isOriginal,
  highlightChanges = false,
  corrections = [],
}: ResumeSheetProps) {
  const appliedPhrases = highlightChanges
    ? corrections.filter((c) => c.applied).map((c) => c.suggestedHighlight)
    : [];

  const renderBulletText = (bullet: string) => {
    if (!highlightChanges || appliedPhrases.length === 0) {
      return <span>{bullet}</span>;
    }

    const matched = appliedPhrases.find((phrase) => phrase && bullet.includes(phrase));
    if (!matched) {
      return <span>{bullet}</span>;
    }

    const parts = bullet.split(matched);
    return (
      <span>
        {parts[0]}
        <span className="bg-teal-100 text-teal-900 font-medium px-1 rounded border-b border-teal-400">
          {matched}
        </span>
        {parts.slice(1).join(matched)}
      </span>
    );
  };

  return (
    <div
      id={id}
      className="w-full p-8 sm:p-10 font-sans text-zinc-900 bg-white leading-normal selection:bg-blue-100"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header Section */}
      <div className="border-b-2 border-zinc-800 pb-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 uppercase">
              {content.name || 'Candidate Name'}
            </h1>
            {content.title && (
              <p className="text-sm sm:text-base font-semibold text-zinc-700">
                {content.title}
              </p>
            )}

            {/* Single-line ATS readable contact row */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-zinc-600 pt-1">
              {content.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-zinc-400 print:hidden" />
                  <a href={`mailto:${content.email}`} className="text-zinc-700 hover:underline">
                    {content.email}
                  </a>
                </span>
              )}

              {content.phone && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-zinc-400 print:hidden" />
                    <span>{content.phone}</span>
                  </span>
                </>
              )}

              {content.location && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400 print:hidden" />
                    <span>{content.location}</span>
                  </span>
                </>
              )}

              {content.linkedin && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-zinc-400 print:hidden" />
                    <span>{content.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </span>
                </>
              )}

              {content.github && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="flex items-center gap-1">
                    <Github className="w-3 h-3 text-zinc-400 print:hidden" />
                    <span>{content.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </span>
                </>
              )}

              {content.portfolio && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-zinc-400 print:hidden" />
                    <span>{content.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Optional Profile Photo in small circular frame */}
          {includePhoto && avatar && (
            <div className="shrink-0 flex flex-col items-center">
              <img
                src={avatar}
                alt={content.name || 'Profile photo'}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-zinc-300 shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {content.summary && (
        <section className="mb-4 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-xs text-zinc-700 leading-relaxed text-justify">
            {renderBulletText(content.summary)}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {content.experience && content.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3">
            {content.experience.map((exp) => (
              <div
                key={exp.id}
                className="space-y-1 break-inside-avoid"
                style={{ pageBreakInside: 'avoid' }}
              >
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900">{exp.role}</span>
                    <span className="text-zinc-600 font-medium"> — {exp.company}</span>
                    {exp.location && (
                      <span className="text-zinc-500 font-normal">, {exp.location}</span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600 font-medium tabular-nums shrink-0">
                    {exp.period}
                  </span>
                </div>

                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 text-xs text-zinc-700 space-y-1 leading-snug">
                    {exp.bullets.map((bullet, idx) => (
                      <li key={idx}>{renderBulletText(bullet)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internships (Preserving user's original section structure) */}
      {content.internships && content.internships.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-2">
            Internships
          </h2>
          <div className="space-y-3">
            {content.internships.map((intern) => (
              <div
                key={intern.id}
                className="space-y-1 break-inside-avoid"
                style={{ pageBreakInside: 'avoid' }}
              >
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900">{intern.role}</span>
                    <span className="text-zinc-600 font-medium"> — {intern.company}</span>
                    {intern.location && (
                      <span className="text-zinc-500 font-normal">, {intern.location}</span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600 font-medium tabular-nums shrink-0">
                    {intern.period}
                  </span>
                </div>

                {intern.bullets && intern.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 text-xs text-zinc-700 space-y-1 leading-snug">
                    {intern.bullets.map((bullet, idx) => (
                      <li key={idx}>{renderBulletText(bullet)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {content.projects && content.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-2">
            Technical Projects
          </h2>
          <div className="space-y-3">
            {content.projects.map((proj) => (
              <div
                key={proj.id}
                className="space-y-1 break-inside-avoid"
                style={{ pageBreakInside: 'avoid' }}
              >
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900">{proj.title}</span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-zinc-600 italic">
                        {' '}
                        | {proj.technologies.join(', ')}
                      </span>
                    )}
                  </div>
                  {proj.link && (
                    <span className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                      {proj.link.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>

                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 text-xs text-zinc-700 space-y-1 leading-snug">
                    {proj.bullets.map((bullet, idx) => (
                      <li key={idx}>{renderBulletText(bullet)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills - Single column clean layout */}
      {content.skills && (
        <section className="mb-4 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-1.5">
            Technical Skills
          </h2>
          <div className="text-xs text-zinc-700 space-y-1 leading-relaxed">
            {content.skills.languages && content.skills.languages.length > 0 && (
              <div>
                <strong className="text-zinc-900">Languages:</strong>{' '}
                {content.skills.languages.join(', ')}
              </div>
            )}
            {content.skills.frameworks && content.skills.frameworks.length > 0 && (
              <div>
                <strong className="text-zinc-900">Frameworks & Libraries:</strong>{' '}
                {content.skills.frameworks.join(', ')}
              </div>
            )}
            {content.skills.databases && content.skills.databases.length > 0 && (
              <div>
                <strong className="text-zinc-900">Databases:</strong>{' '}
                {content.skills.databases.join(', ')}
              </div>
            )}
            {content.skills.tools && content.skills.tools.length > 0 && (
              <div>
                <strong className="text-zinc-900">Developer Tools:</strong>{' '}
                {content.skills.tools.join(', ')}
              </div>
            )}
            {content.skills.softSkills && content.skills.softSkills.length > 0 && (
              <div>
                <strong className="text-zinc-900">Competencies:</strong>{' '}
                {content.skills.softSkills.join(', ')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {content.education && content.education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {content.education.map((ed) => (
              <div
                key={ed.id}
                className="text-xs break-inside-avoid"
                style={{ pageBreakInside: 'avoid' }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-zinc-900">{ed.degree}</span>
                  <span className="text-zinc-600 font-medium tabular-nums">
                    {ed.graduationDate}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-zinc-600">
                  <span>{ed.institution}</span>
                  {ed.gpa && <span className="text-zinc-500">GPA: {ed.gpa}</span>}
                </div>
                {ed.coursework && ed.coursework.length > 0 && (
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Coursework: {ed.coursework.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications (if present) */}
      {content.certifications && content.certifications.length > 0 && (
        <section className="mb-3 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-1.5">
            Certifications
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-zinc-700 space-y-0.5">
            {content.certifications.map((c) => (
              <li key={c.id}>
                <span className="font-semibold text-zinc-900">{c.name}</span>
                {c.issuer && <span className="text-zinc-600"> — {c.issuer}</span>}
                {c.date && <span className="text-zinc-500"> ({c.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Achievements / Honors (if present) */}
      {content.achievements && content.achievements.length > 0 && (
        <section className="mb-3 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-1.5">
            Achievements & Honors
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-zinc-700 space-y-0.5">
            {content.achievements.map((a) => (
              <li key={a.id}>
                <span className="font-semibold text-zinc-900">{a.title}</span>
                {a.description && <span className="text-zinc-600"> — {a.description}</span>}
                {a.date && <span className="text-zinc-500"> ({a.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Custom Sections from original resume (if present) */}
      {content.customSections && content.customSections.length > 0 && (
        <>
          {content.customSections.map((sec) => (
            <section
              key={sec.id}
              className="mb-3 break-inside-avoid"
              style={{ pageBreakInside: 'avoid' }}
            >
              <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800 border-b border-zinc-300 pb-0.5 mb-1.5">
                {sec.title}
              </h2>
              <ul className="list-disc list-outside ml-4 text-xs text-zinc-700 space-y-0.5">
                {sec.content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
