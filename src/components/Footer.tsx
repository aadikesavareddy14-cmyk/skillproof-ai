import { SkillProofLogo } from '@/components/SkillProofLogo';

const footerLinks = {
  Product: ['How it works', 'Features', 'Pricing', 'FAQ'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <SkillProofLogo variant="lockup" size="navbar" />
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Don't trust the resume. Verify the skill. AI-powered career
              intelligence and skill verification.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-zinc-300 mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            © 2026 SkillProof AI. All rights reserved.
          </p>
          <p className="text-sm text-zinc-600">
            Built for professionals who prove what they know.
          </p>
        </div>
      </div>
    </footer>
  );
}
