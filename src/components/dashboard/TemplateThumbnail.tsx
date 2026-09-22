import type { ResumeTemplateMeta } from '@/lib/resumeTemplatesData';

export function TemplateThumbnail({ template }: { template: ResumeTemplateMeta }) {
  const { id, accentColor } = template;

  return (
    <div className="w-full aspect-[8.5/11] bg-white rounded-lg p-2.5 flex flex-col justify-between shadow-inner border border-zinc-200 overflow-hidden relative select-none">
      {/* Visual representation based on template id */}
      {id === 'modern-minimal' && (
        <div className="space-y-1.5 w-full">
          {/* Top header */}
          <div className="h-2 w-1/2 bg-zinc-800 rounded-sm" />
          <div className="h-1 w-1/3 rounded-sm" style={{ backgroundColor: accentColor }} />
          <div className="w-full h-px bg-zinc-200 mt-1" />
          {/* Summary lines */}
          <div className="space-y-0.5 pt-0.5">
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
          </div>
          {/* Experience */}
          <div className="pt-1">
            <div className="h-1.5 w-1/4 rounded-sm mb-1" style={{ backgroundColor: accentColor }} />
            <div className="space-y-1">
              <div className="h-1 w-3/4 bg-zinc-400 rounded-sm" />
              <div className="h-1 w-full bg-zinc-200 rounded-sm" />
              <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
            </div>
          </div>
          {/* Projects */}
          <div className="pt-1">
            <div className="h-1.5 w-1/4 rounded-sm mb-1" style={{ backgroundColor: accentColor }} />
            <div className="space-y-1">
              <div className="h-1 w-2/3 bg-zinc-400 rounded-sm" />
              <div className="h-1 w-11/12 bg-zinc-200 rounded-sm" />
            </div>
          </div>
        </div>
      )}

      {id === 'classic-professional' && (
        <div className="space-y-1.5 w-full text-center flex flex-col items-center">
          <div className="h-2 w-3/5 bg-zinc-900 rounded-sm" />
          <div className="h-1 w-2/5 bg-zinc-500 rounded-sm" />
          <div className="w-full border-t-2 border-b border-zinc-300 my-0.5 py-0.5" />
          <div className="w-full space-y-1 text-left">
            <div className="h-1.5 w-1/3 bg-zinc-800 rounded-sm" />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-4/5 bg-zinc-200 rounded-sm" />
          </div>
          <div className="w-full space-y-1 text-left pt-1">
            <div className="h-1.5 w-1/3 bg-zinc-800 rounded-sm" />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-3/4 bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {id === 'technical-engineering' && (
        <div className="space-y-1.5 w-full">
          <div className="flex justify-between items-center">
            <div className="h-2 w-2/5 bg-zinc-900 rounded-sm" />
            <div className="flex gap-0.5">
              <div className="h-1.5 w-3 bg-emerald-100 border border-emerald-400 rounded" />
              <div className="h-1.5 w-3 bg-emerald-100 border border-emerald-400 rounded" />
            </div>
          </div>
          <div className="h-1 w-1/4 rounded-sm" style={{ backgroundColor: accentColor }} />
          {/* Tech skill badges */}
          <div className="flex flex-wrap gap-0.5 pt-0.5">
            <div className="h-1.5 w-5 bg-zinc-100 border border-zinc-300 rounded-sm" />
            <div className="h-1.5 w-6 bg-zinc-100 border border-zinc-300 rounded-sm" />
            <div className="h-1.5 w-4 bg-zinc-100 border border-zinc-300 rounded-sm" />
          </div>
          {/* Dense bullets */}
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-1/3 rounded-sm" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-full bg-zinc-300 rounded-sm" />
            <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {id === 'creative-bold' && (
        <div className="space-y-1.5 w-full -m-2.5 p-2.5">
          {/* Bold top banner */}
          <div
            className="w-full h-8 rounded-t-md p-1 flex items-center justify-between text-white"
            style={{ backgroundColor: accentColor }}
          >
            <div className="space-y-0.5">
              <div className="h-1.5 w-12 bg-white rounded-sm" />
              <div className="h-1 w-8 bg-white/70 rounded-sm" />
            </div>
            <div className="w-5 h-5 rounded-full bg-white/30 border border-white/50" />
          </div>
          <div className="p-1 space-y-1.5">
            <div className="h-1.5 w-1/4 rounded-sm" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-4/5 bg-zinc-200 rounded-sm" />
            <div className="h-1.5 w-1/4 rounded-sm pt-1" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {id === 'two-column-compact' && (
        <div className="w-full h-full flex gap-2 -m-2.5 p-2.5">
          {/* Left Column */}
          <div className="w-1/3 bg-zinc-100 rounded-l-md p-1.5 space-y-1.5 border-r border-zinc-200">
            <div className="w-5 h-5 rounded-full bg-zinc-300 mx-auto" />
            <div className="h-1.5 w-full bg-zinc-800 rounded-sm" />
            <div className="h-1 w-2/3 rounded-sm" style={{ backgroundColor: accentColor }} />
            <div className="space-y-0.5 pt-1">
              <div className="h-1 w-full bg-zinc-300 rounded-sm" />
              <div className="h-1 w-4/5 bg-zinc-300 rounded-sm" />
            </div>
          </div>
          {/* Right Column */}
          <div className="w-2/3 p-1 space-y-1.5">
            <div className="h-1.5 w-1/3 rounded-sm" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
            <div className="h-1.5 w-1/3 rounded-sm pt-1" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {id === 'executive' && (
        <div className="space-y-1.5 w-full">
          <div className="border-b-2 pb-1" style={{ borderColor: accentColor }}>
            <div className="h-2 w-3/5 bg-zinc-950 rounded-sm" />
            <div className="h-1 w-2/5 rounded-sm mt-0.5" style={{ backgroundColor: accentColor }} />
          </div>
          {/* Executive summary block */}
          <div className="p-1 bg-amber-50/50 border-l-2 rounded-r-sm space-y-0.5" style={{ borderColor: accentColor }}>
            <div className="h-1 w-full bg-zinc-300 rounded-sm" />
            <div className="h-1 w-4/5 bg-zinc-300 rounded-sm" />
          </div>
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-1/4 bg-zinc-800 rounded-sm" />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {id === 'ats-optimized-simple' && (
        <div className="space-y-1 w-full">
          <div className="h-2 w-1/2 bg-zinc-950 rounded-sm" />
          <div className="h-1 w-full bg-zinc-400 rounded-sm" />
          <div className="w-full h-px bg-zinc-300" />
          <div className="h-1.5 w-1/3 bg-zinc-800 rounded-sm mt-1" />
          <div className="h-1 w-full bg-zinc-200 rounded-sm" />
          <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
          <div className="h-1.5 w-1/3 bg-zinc-800 rounded-sm mt-1" />
          <div className="h-1 w-full bg-zinc-200 rounded-sm" />
          <div className="h-1 w-4/5 bg-zinc-200 rounded-sm" />
        </div>
      )}

      {id === 'academic' && (
        <div className="space-y-1.5 w-full text-center">
          <div className="h-2 w-1/2 bg-zinc-900 mx-auto rounded-sm" />
          <div className="h-1 w-1/3 bg-zinc-500 mx-auto rounded-sm" />
          <div className="w-full h-px bg-zinc-300" />
          <div className="text-left space-y-1">
            <div className="h-1.5 w-1/3 bg-zinc-700 rounded-sm" />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1.5 w-1/3 bg-zinc-700 rounded-sm pt-1" />
            <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {id === 'startup-modern-tech' && (
        <div className="space-y-1.5 w-full -m-2.5 p-2.5">
          <div
            className="w-full h-7 rounded-t-md p-1.5 flex items-center justify-between text-white"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, #09090b)`,
            }}
          >
            <div className="h-1.5 w-14 bg-white rounded-sm" />
            <div className="w-4 h-4 rounded-full bg-white/40" />
          </div>
          <div className="p-1 space-y-1">
            <div className="flex gap-1">
              <div className="h-1.5 w-5 rounded-full" style={{ backgroundColor: `${accentColor}30`, border: `1px solid ${accentColor}` }} />
              <div className="h-1.5 w-5 rounded-full" style={{ backgroundColor: `${accentColor}30`, border: `1px solid ${accentColor}` }} />
            </div>
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-4/5 bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {id === 'elegant-serif' && (
        <div className="space-y-1.5 w-full">
          <div className="flex justify-between items-baseline border-b border-zinc-300 pb-1">
            <div className="h-2 w-2/5 bg-zinc-900 rounded-sm" />
            <div className="h-1 w-1/4 rounded-sm" style={{ backgroundColor: accentColor }} />
          </div>
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-1/4 font-serif rounded-sm" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
            <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
            <div className="h-1.5 w-1/4 font-serif rounded-sm pt-1" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-full bg-zinc-200 rounded-sm" />
          </div>
        </div>
      )}

      {/* Subtle bottom footer line */}
      <div className="w-full h-1 bg-zinc-100 rounded-sm mt-auto" />
    </div>
  );
}
