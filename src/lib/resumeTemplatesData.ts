export interface ResumeTemplateMeta {
  id: string;
  name: string;
  descriptor: string;
  tag: string;
  category: 'Modern' | 'Traditional' | 'Technical' | 'Creative';
  accentColor: string;
  bgPreview: string;
  supportsPhoto: boolean;
  idealFor: string;
}

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    descriptor: 'Best for: Software roles, ATS-friendly, clean single column with crisp typography',
    tag: 'ATS Top Pick',
    category: 'Modern',
    accentColor: '#0ea5e9', // Sky blue
    bgPreview: 'from-sky-950/40 to-zinc-900',
    supportsPhoto: false,
    idealFor: 'Software Engineers, Frontend Developers, Product Managers',
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    descriptor: 'Best for: Corporate, finance, consulting, and traditional enterprise engineering roles',
    tag: 'Executive Standard',
    category: 'Traditional',
    accentColor: '#334155', // Slate
    bgPreview: 'from-slate-950/40 to-zinc-900',
    supportsPhoto: false,
    idealFor: 'Management, Engineering Managers, Consultants, Analysts',
  },
  {
    id: 'technical-engineering',
    name: 'Technical / Engineering',
    descriptor: 'Best for: Backend & Systems engineers, highlighting code repos, tech tags, and metric density',
    tag: 'Developer Favorite',
    category: 'Technical',
    accentColor: '#10b981', // Emerald
    bgPreview: 'from-emerald-950/40 to-zinc-900',
    supportsPhoto: false,
    idealFor: 'Full-Stack, Backend, DevOps, Platform Engineers',
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    descriptor: 'Best for: Design technologist, UX/UI, and product engineering with a distinctive accent header',
    tag: 'High Visual Impact',
    category: 'Creative',
    accentColor: '#8b5cf6', // Violet
    bgPreview: 'from-violet-950/40 to-zinc-900',
    supportsPhoto: true,
    idealFor: 'UI/UX Engineers, Design Engineers, Creative Technologists',
  },
  {
    id: 'two-column-compact',
    name: 'Two-Column Compact',
    descriptor: 'Best for: High-density skills and certifications on the left, rich project experience on the right',
    tag: 'Max Information',
    category: 'Modern',
    accentColor: '#14b8a6', // Teal
    bgPreview: 'from-teal-950/40 to-zinc-900',
    supportsPhoto: true,
    idealFor: 'Experienced Engineers, Data Scientists, Cloud Architects',
  },
  {
    id: 'executive',
    name: 'Executive',
    descriptor: 'Best for: Senior staff, tech leads, and directors prioritizing leadership achievements and scale',
    tag: 'Leadership',
    category: 'Traditional',
    accentColor: '#d97706', // Warm amber / gold
    bgPreview: 'from-amber-950/40 to-zinc-900',
    supportsPhoto: false,
    idealFor: 'Staff/Principal Engineers, Directors, VP of Engineering',
  },
  {
    id: 'ats-optimized-simple',
    name: 'ATS-Optimized Simple',
    descriptor: 'Best for: Guaranteed 100% parsing fidelity across Workday, Taleo, Greenhouse, and Lever ATS systems',
    tag: '100% ATS Verified',
    category: 'Technical',
    accentColor: '#2563eb', // Blue
    bgPreview: 'from-blue-950/40 to-zinc-900',
    supportsPhoto: false,
    idealFor: 'All software disciplines, large enterprise job boards',
  },
  {
    id: 'academic',
    name: 'Academic',
    descriptor: 'Best for: Research engineers, PhD/Master students, publications, and intensive coursework depth',
    tag: 'Research & Scholarly',
    category: 'Traditional',
    accentColor: '#475569', // Muted Slate
    bgPreview: 'from-zinc-900 to-zinc-950',
    supportsPhoto: false,
    idealFor: 'AI/ML Researchers, Graduate Students, Research Scientists',
  },
  {
    id: 'startup-modern-tech',
    name: 'Startup / Modern Tech',
    descriptor: 'Best for: Early-stage YC startups and fast-moving tech companies valuing velocity and shipped features',
    tag: 'Startup Ready',
    category: 'Modern',
    accentColor: '#f43f5e', // Rose
    bgPreview: 'from-rose-950/40 to-zinc-900',
    supportsPhoto: true,
    idealFor: 'Founding Engineers, Growth Engineers, Full-Stack Generalists',
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    descriptor: 'Best for: Refined editorial aesthetics, balanced proportions, and distinguished typographic presence',
    tag: 'Editorial Distinction',
    category: 'Creative',
    accentColor: '#059669', // Deep Emerald
    bgPreview: 'from-emerald-950/30 to-zinc-900',
    supportsPhoto: false,
    idealFor: 'Senior Developers, Product Strategists, Technical Writers',
  },
];
