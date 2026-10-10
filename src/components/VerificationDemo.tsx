import { FileText, CheckCircle2, XCircle, Github, Brain, BarChart3 } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function VerificationDemo() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="verification" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`reveal ${visible ? 'reveal-visible' : ''} text-center mb-16`}
        >
          <p className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-3">
            The verification difference
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            A resume says it. SkillProof proves it.
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Anyone can list "Python" on a resume. SkillProof AI cross-references
            claims against real evidence to produce a confidence score.
          </p>
        </div>

        <div className={`reveal ${visible ? 'reveal-visible' : ''} grid md:grid-cols-2 gap-6 lg:gap-8`}>
          {/* Before: Resume claim */}
          <div className="relative p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Traditional resume</p>
                <h3 className="text-lg font-semibold text-zinc-300">Unverified claim</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <span className="text-zinc-300 font-medium">Python</span>
                <span className="text-sm text-zinc-500">Listed on resume</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <span className="text-zinc-300 font-medium">React</span>
                <span className="text-sm text-zinc-500">Listed on resume</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <span className="text-zinc-300 font-medium">System Design</span>
                <span className="text-sm text-zinc-500">Listed on resume</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <XCircle className="w-4 h-4 text-red-500/70" />
              No evidence. No verification. No confidence.
            </div>
          </div>

          {/* After: SkillProof verified */}
          <div className="relative p-8 rounded-2xl border border-blue-600/30 bg-gradient-to-b from-blue-950/20 to-zinc-900/40 animate-pulse-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-blue-500">SkillProof verified</p>
                <h3 className="text-lg font-semibold text-white">Evidence-backed profile</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Python</span>
                  <span className="text-sm font-semibold text-teal-400">87% confidence</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" /> 12 repos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> Advanced
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: '87%' }} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">React</span>
                  <span className="text-sm font-semibold text-teal-400">92% confidence</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" /> 8 repos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Expert
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">System Design</span>
                  <span className="text-sm font-semibold text-amber-400">71% confidence</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" /> 3 repos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> Intermediate
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-amber-400" style={{ width: '71%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
              Verified through code, projects, and adaptive assessments.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
