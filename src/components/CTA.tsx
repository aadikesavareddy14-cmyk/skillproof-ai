import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface CTAProps {
  onGetStarted: () => void;
}

export function CTA({ onGetStarted }: CTAProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`reveal ${visible ? 'reveal-visible' : ''} relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-12 md:p-16 text-center`}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Stop claiming. Start proving.
            </h2>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-8">
              Join thousands of professionals who verify their skills and land better
              jobs with SkillProof AI. It is free to get started.
            </p>
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-lg transition-all hover:scale-[1.02] animate-pulse-glow"
            >
              Get started free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
