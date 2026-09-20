import { Link, GitBranch, Target, Map } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const steps = [
  {
    icon: Link,
    title: 'Upload your resume',
    description: 'Upload your resume in seconds. SkillProof AI analyzes your skills, metrics, and project outcomes automatically.',
    step: '01',
  },
  {
    icon: GitBranch,
    title: 'AI scores & verifies skills',
    description: 'Our engine evaluates your experience bullets, projects, and achievements — then runs adaptive assessments.',
    step: '02',
  },
  {
    icon: Target,
    title: 'Match to jobs & see gaps',
    description: 'Get matched to roles based on verified skills, not buzzwords. See exactly where you fall short and where you shine.',
    step: '03',
  },
  {
    icon: Map,
    title: 'Get a personalized roadmap',
    description: 'Receive a targeted learning plan that closes your skill gaps and strengthens your profile for the roles you want.',
    step: '04',
  },
];

export function HowItWorks() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`reveal ${visible ? 'reveal-visible' : ''} text-center mb-16`}
        >
          <p className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            From claims to proof in four steps
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            No more guessing whether a candidate can do what they say. SkillProof AI
            turns real evidence into verified skill profiles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className={`reveal ${visible ? 'reveal-visible' : ''} group relative p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-6 right-6 text-4xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors">
                {s.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-5 group-hover:bg-blue-600/20 transition-colors">
                <s.icon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
