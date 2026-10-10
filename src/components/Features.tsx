import { Network, Target, Brain, Map } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const features = [
  {
    icon: Network,
    title: 'Skill Knowledge Graph',
    description: 'See how your skills interconnect. Our graph maps relationships between technologies, frameworks, and domains to reveal your true expertise areas.',
  },
  {
    icon: Target,
    title: 'Job Fit Scoring',
    description: 'Stop guessing if you are a match. Get a precise fit score for every job listing based on your verified skills versus what the role actually requires.',
  },
  {
    icon: Brain,
    title: 'Adaptive Skill Assessments',
    description: 'Dynamic assessments that adjust difficulty based on your responses, giving a precise measure of your actual proficiency — not just self-reported level.',
  },
  {
    icon: Map,
    title: 'Personalized Learning Roadmaps',
    description: 'Get a step-by-step plan that targets your specific skill gaps, ranked by impact on your job match scores and career goals.',
  },
];

export function Features() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`reveal ${visible ? 'reveal-visible' : ''} text-center mb-16`}
        >
          <p className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to prove your skills
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            A complete platform for skill verification, job matching, and career growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal ${visible ? 'reveal-visible' : ''} group p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                  <f.icon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
