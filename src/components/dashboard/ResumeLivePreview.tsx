import { useRef } from 'react';
import {
  Download,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { ResumeStructuredContent } from '@/lib/resumeData';
import type { ResumeTemplateMeta } from '@/lib/resumeTemplatesData';

interface ResumeLivePreviewProps {
  template: ResumeTemplateMeta;
  content: ResumeStructuredContent;
  onBackToGallery: () => void;
  onModifyWithAi?: () => void;
}

export function ResumeLivePreview({
  template,
  content,
  onBackToGallery,
  onModifyWithAi,
}: ResumeLivePreviewProps) {
  const { profile } = useAuth();
  const resumeRef = useRef<HTMLDivElement>(null);

  const avatar = profile.avatarUrl;

  const handlePrintDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGallery}
            className="press-scale p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Pick another template"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100">Live Preview:</span>
              <span className="text-sm font-bold text-blue-400">{template.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {template.tag}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{template.descriptor}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onModifyWithAi && (
            <button
              onClick={onModifyWithAi}
              className="press-scale flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-blue-400 border border-zinc-700 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Modify with AI
            </button>
          )}
          <button
            onClick={onBackToGallery}
            className="press-scale px-3.5 py-2 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition-colors"
          >
            Change template
          </button>
          <button
            onClick={handlePrintDownload}
            className="press-scale flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download as PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet Viewport */}
      <div className="flex justify-center overflow-x-auto py-4">
        <div
          ref={resumeRef}
          id="resume-printable-sheet"
          className={`w-full max-w-[850px] min-h-[1100px] bg-white text-zinc-900 shadow-2xl rounded-xl sm:rounded-2xl p-8 sm:p-12 transition-all ${
            template.id === 'classic-professional' || template.id === 'elegant-serif'
              ? 'font-serif'
              : 'font-sans'
          }`}
        >
          {/* Template Renderer Selection */}
          {template.id === 'two-column-compact' ? (
            <TwoColumnLayout content={content} template={template} avatar={avatar} />
          ) : template.id === 'creative-bold' || template.id === 'startup-modern-tech' ? (
            <AccentHeaderLayout content={content} template={template} avatar={avatar} />
          ) : (
            <StandardSingleColumnLayout content={content} template={template} avatar={avatar} />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Standard Single-Column Layout (Used by Minimal, Classic, Technical, ATS, Academic, Serif)
// ----------------------------------------------------
function StandardSingleColumnLayout({
  content,
  template,
  avatar,
}: {
  content: ResumeStructuredContent;
  template: ResumeTemplateMeta;
  avatar: string | null;
}) {
  const isClassic = template.id === 'classic-professional';
  const isATS = template.id === 'ats-optimized-simple';

  return (
    <div className="space-y-6 text-zinc-900 leading-normal text-[13px]">
      {/* Header */}
      <header
        className={`pb-4 border-b ${
          isClassic ? 'text-center border-zinc-400 pb-5' : 'border-zinc-200'
        }`}
      >
        <div
          className={`flex ${
            isClassic ? 'flex-col items-center' : 'justify-between items-start'
          } gap-4`}
        >
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 ${
                isClassic ? 'uppercase tracking-widest' : ''
              }`}
            >
              {content.name || 'Your Name'}
            </h1>
            <p
              className={`text-sm font-semibold mt-1`}
              style={{ color: template.accentColor }}
            >
              {content.title || 'Your Professional Title'}
            </p>
          </div>

          {avatar && template.supportsPhoto && (
            <img
              src={avatar}
              alt={content.name || 'Profile'}
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200 shadow-sm"
            />
          )}
        </div>

        {/* Contact Links */}
        <div
          className={`flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-600 mt-3 ${
            isClassic ? 'justify-center' : ''
          }`}
        >
          {content.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              {content.email}
            </span>
          )}
          {content.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              {content.phone}
            </span>
          )}
          {content.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              {content.location}
            </span>
          )}
          {content.linkedin && (
            <span className="inline-flex items-center gap-1 font-medium text-blue-600">
              <Linkedin className="w-3.5 h-3.5" />
              {content.linkedin}
            </span>
          )}
          {content.github && (
            <span className="inline-flex items-center gap-1 font-medium text-zinc-800">
              <Github className="w-3.5 h-3.5" />
              {content.github}
            </span>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {content.summary ? (
        <section>
          <h2
            className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              isATS ? 'border-b border-zinc-300 pb-1 text-zinc-900' : ''
            }`}
            style={{ color: isATS ? undefined : template.accentColor }}
          >
            Professional Summary
          </h2>
          <p className="text-zinc-700 leading-relaxed text-justify">{content.summary}</p>
        </section>
      ) : null}

      {/* Work Experience */}
      <section>
        <h2
          className={`text-xs font-bold uppercase tracking-wider mb-3 ${
            isATS ? 'border-b border-zinc-300 pb-1 text-zinc-900' : ''
          }`}
          style={{ color: isATS ? undefined : template.accentColor }}
        >
          Experience
        </h2>
        {content.experience.length > 0 ? (
          <div className="space-y-4">
            {content.experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                  <div className="font-bold text-zinc-950 text-sm">
                    {exp.role} <span className="font-normal text-zinc-600">| {exp.company}</span>
                  </div>
                  <div className="text-zinc-500 font-medium sm:text-right">
                    {exp.period} • {exp.location}
                  </div>
                </div>
                <ul className="list-disc list-outside pl-4 space-y-1 text-zinc-700 text-xs mt-1 leading-relaxed">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
            Add your work experience
          </div>
        )}
      </section>

      {/* Projects */}
      <section>
        <h2
          className={`text-xs font-bold uppercase tracking-wider mb-3 ${
            isATS ? 'border-b border-zinc-300 pb-1 text-zinc-900' : ''
          }`}
          style={{ color: isATS ? undefined : template.accentColor }}
        >
          Projects
        </h2>
        {content.projects.length > 0 ? (
          <div className="space-y-3">
            {content.projects.map((proj) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                  <div className="font-bold text-zinc-950 text-sm flex items-center gap-2">
                    <span>{proj.title}</span>
                    {proj.link && (
                      <span className="text-[11px] font-normal text-blue-600 underline">
                        ({proj.link})
                      </span>
                    )}
                  </div>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="text-[11px] font-medium text-zinc-500">
                    <span className="font-semibold text-zinc-700">Technologies:</span>{' '}
                    {proj.technologies.join(', ')}
                  </div>
                )}
                <ul className="list-disc list-outside pl-4 space-y-0.5 text-zinc-700 text-xs mt-1 leading-relaxed">
                  {proj.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
            Add your projects
          </div>
        )}
      </section>

      {/* Skills */}
      <section>
        <h2
          className={`text-xs font-bold uppercase tracking-wider mb-2 ${
            isATS ? 'border-b border-zinc-300 pb-1 text-zinc-900' : ''
          }`}
          style={{ color: isATS ? undefined : template.accentColor }}
        >
          Technical Skills
        </h2>
        {content.skills && (content.skills.languages?.length > 0 || content.skills.frameworks?.length > 0 || content.skills.databases?.length > 0 || content.skills.tools?.length > 0) ? (
          <div className="space-y-1 text-xs text-zinc-800">
            {content.skills.languages?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Languages:</span>{' '}
                {content.skills.languages.join(', ')}
              </p>
            )}
            {content.skills.frameworks?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Frameworks:</span>{' '}
                {content.skills.frameworks.join(', ')}
              </p>
            )}
            {content.skills.databases?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Databases:</span>{' '}
                {content.skills.databases.join(', ')}
              </p>
            )}
            {content.skills.tools?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Developer Tools:</span>{' '}
                {content.skills.tools.join(', ')}
              </p>
            )}
          </div>
        ) : (
          <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
            Add your skills
          </div>
        )}
      </section>

      {/* Education */}
      <section>
        <h2
          className={`text-xs font-bold uppercase tracking-wider mb-2 ${
            isATS ? 'border-b border-zinc-300 pb-1 text-zinc-900' : ''
          }`}
          style={{ color: isATS ? undefined : template.accentColor }}
        >
          Education
        </h2>
        {content.education.length > 0 ? (
          <div className="space-y-2">
            {content.education.map((edu) => (
              <div key={edu.id} className="text-xs space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-zinc-950 text-sm">{edu.institution}</span>
                  <span className="text-zinc-500">{edu.graduationDate}</span>
                </div>
                <div className="text-zinc-700">
                  {edu.degree} {edu.gpa ? `— GPA: ${edu.gpa}` : ''}
                </div>
                {edu.coursework && edu.coursework.length > 0 && (
                  <p className="text-[11px] text-zinc-500">
                    <span className="font-semibold text-zinc-700">Coursework:</span>{' '}
                    {edu.coursework.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
            Add your education
          </div>
        )}
      </section>
    </div>
  );
}

// ----------------------------------------------------
// Two-Column Compact Layout
// ----------------------------------------------------
function TwoColumnLayout({
  content,
  template,
  avatar,
}: {
  content: ResumeStructuredContent;
  template: ResumeTemplateMeta;
  avatar: string | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-[12px] text-zinc-900">
      {/* Left Sidebar (4 cols) */}
      <div className="md:col-span-4 bg-zinc-50/80 -m-8 sm:-m-12 p-8 sm:p-10 border-r border-zinc-200 space-y-6">
        {avatar && (
          <div className="flex justify-center">
            <img
              src={avatar}
              alt={content.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
        )}

        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">{content.name}</h1>
          <p className="text-xs font-semibold mt-0.5" style={{ color: template.accentColor }}>
            {content.title}
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-xs text-zinc-700 pt-2 border-t border-zinc-200">
          <p className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 mb-2">
            Contact
          </p>
          {content.email && <p className="truncate">{content.email}</p>}
          {content.phone && <p>{content.phone}</p>}
          {content.location && <p>{content.location}</p>}
          {content.linkedin && <p className="text-blue-600 truncate">{content.linkedin}</p>}
          {content.github && <p className="truncate font-mono text-[11px]">{content.github}</p>}
        </div>

        {/* Skills sidebar */}
        <div className="space-y-2 pt-2 border-t border-zinc-200">
          <p className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 mb-2">
            Skills
          </p>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-zinc-900 block text-[11px]">Languages</span>
              <span className="text-zinc-600">{content.skills.languages.join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 block text-[11px]">Frameworks</span>
              <span className="text-zinc-600">{content.skills.frameworks.join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 block text-[11px]">Databases</span>
              <span className="text-zinc-600">{content.skills.databases.join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 block text-[11px]">Tools</span>
              <span className="text-zinc-600">{content.skills.tools.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Education sidebar */}
        <div className="space-y-2 pt-2 border-t border-zinc-200">
          <p className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 mb-2">
            Education
          </p>
          {content.education.length > 0 ? (
            content.education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <p className="font-bold text-zinc-950">{edu.institution}</p>
                <p className="text-zinc-700">{edu.degree}</p>
                <p className="text-[11px] text-zinc-500">
                  {edu.graduationDate} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-zinc-400 italic">Add your education</p>
          )}
        </div>
      </div>

      {/* Right Column (8 cols) */}
      <div className="md:col-span-8 space-y-6 pt-2">
        {content.summary ? (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: template.accentColor }}
            >
              Summary
            </h2>
            <p className="text-zinc-700 leading-relaxed text-xs">{content.summary}</p>
          </section>
        ) : null}

        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: template.accentColor }}
          >
            Work Experience
          </h2>
          {content.experience.length > 0 ? (
            <div className="space-y-4">
              {content.experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-zinc-950 text-sm">
                      {exp.role} — <span className="font-normal text-zinc-600">{exp.company}</span>
                    </span>
                    <span className="text-zinc-500 text-[11px]">{exp.period}</span>
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-zinc-700 text-xs mt-1 leading-relaxed">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
              Add your work experience
            </div>
          )}
        </section>

        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: template.accentColor }}
          >
            Featured Projects
          </h2>
          {content.projects.length > 0 ? (
            <div className="space-y-3">
              {content.projects.map((proj) => (
                <div key={proj.id} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-zinc-950 text-sm">{proj.title}</span>
                    {proj.link && <span className="text-[11px] text-blue-600">{proj.link}</span>}
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-zinc-700 text-xs leading-relaxed">
                    {proj.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
              Add your projects
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Accent Header Layout (Creative Bold & Startup)
// ----------------------------------------------------
function AccentHeaderLayout({
  content,
  template,
  avatar,
}: {
  content: ResumeStructuredContent;
  template: ResumeTemplateMeta;
  avatar: string | null;
}) {
  return (
    <div className="space-y-6 text-[13px] text-zinc-900">
      {/* Top Banner */}
      <div
        className="-m-8 sm:-m-12 p-8 sm:p-10 text-white rounded-t-xl sm:rounded-t-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{
          background: `linear-gradient(135deg, ${template.accentColor}, #09090b)`,
        }}
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{content.name || 'Your Name'}</h1>
          <p className="text-sm font-medium text-white/90 mt-1">{content.title || 'Your Professional Title'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80 mt-3">
            {content.email && <span>{content.email}</span>}
            {content.phone && <span>{content.phone}</span>}
            {content.location && <span>{content.location}</span>}
            {content.github && <span>{content.github}</span>}
          </div>
        </div>

        {avatar && (
          <img
            src={avatar}
            alt={content.name || 'Profile'}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/40 shadow-xl"
          />
        )}
      </div>

      {content.summary ? (
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: template.accentColor }}
          >
            About Me
          </h2>
          <p className="text-zinc-700 leading-relaxed">{content.summary}</p>
        </section>
      ) : null}

      {/* Experience */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: template.accentColor }}
        >
          Experience
        </h2>
        {content.experience.length > 0 ? (
          <div className="space-y-4">
            {content.experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-zinc-950 text-sm">
                    {exp.role} <span className="font-normal text-zinc-600">@ {exp.company}</span>
                  </span>
                  <span className="text-zinc-500 font-medium">{exp.period}</span>
                </div>
                <ul className="list-disc list-outside pl-4 space-y-1 text-zinc-700 text-xs mt-1 leading-relaxed">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
            Add your work experience
          </div>
        )}
      </section>

      {/* Projects */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: template.accentColor }}
        >
          Selected Projects
        </h2>
        {content.projects.length > 0 ? (
          <div className="space-y-3">
            {content.projects.map((proj) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-zinc-950 text-sm">{proj.title}</span>
                  {proj.link && <span className="text-xs text-blue-600">{proj.link}</span>}
                </div>
                <ul className="list-disc list-outside pl-4 space-y-0.5 text-zinc-700 text-xs leading-relaxed">
                  {proj.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-xs italic text-zinc-400 border border-dashed border-zinc-200 rounded-lg text-center">
            Add your projects
          </div>
        )}
      </section>

      {/* Skills Grid */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{ color: template.accentColor }}
        >
          Core Technologies
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {[
            ...content.skills.languages,
            ...content.skills.frameworks,
            ...content.skills.databases,
            ...content.skills.tools,
          ].map((skill) => (
            <span
              key={skill}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{ color: template.accentColor }}
        >
          Education
        </h2>
        {content.education.map((edu) => (
          <div key={edu.id} className="text-xs flex justify-between items-baseline">
            <div>
              <p className="font-bold text-zinc-950">{edu.institution}</p>
              <p className="text-zinc-700">{edu.degree}</p>
            </div>
            <span className="text-zinc-500">{edu.graduationDate}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
