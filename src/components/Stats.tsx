import { useScrollReveal } from '@/hooks/useScrollReveal';

const stats = [
  { value: '2.4M+', label: 'Skills verified' },
  { value: '180K+', label: 'Job matches generated' },
  { value: '95%', label: 'Assessment accuracy' },
  { value: '45K+', label: 'Active professionals' },
];

export function Stats() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="stats" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`reveal ${visible ? 'reveal-visible' : ''}`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="text-center"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient-accent mb-2">
                  {s.value}
                </div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
