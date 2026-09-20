export interface ResumeScoreFactor {
  key: 'clarity' | 'metrics' | 'keywords' | 'structure' | 'completeness';
  name: string;
  score: number;
  maxScore: number;
  description: string;
  status: 'strong' | 'good' | 'needs-work';
}

export interface ResumeSkillEntry {
  name: string;
  confidence: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  supportLevel: 'deeply-supported' | 'supported' | 'listed-only';
  supportLabel: string;
  evidenceNote: string;
  sources: string[];
  mentionsCount: number;
}

export interface ResumeImprovementSuggestion {
  id: string;
  category: 'metrics' | 'ungrounded-skills' | 'structure' | 'keywords' | 'completeness';
  title: string;
  suggestion: string;
  impact: 'High Impact' | 'Medium Impact' | 'Quick Fix';
  scorePotential: string;
}

export interface ResumeAnalysisData {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  overallScore: number;
  qualitativeLabel: 'Needs Work' | 'Good' | 'Strong';
  previousScore: number | null;
  scoreDelta: number | null;
  factors: ResumeScoreFactor[];
  skills: ResumeSkillEntry[];
  suggestions: ResumeImprovementSuggestion[];
  summary: string;
}

export function getQualitativeLabel(score: number): 'Needs Work' | 'Good' | 'Strong' {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Good';
  return 'Needs Work';
}

export const defaultResumeAnalysis: ResumeAnalysisData = {
  fileName: 'resume.pdf',
  fileSize: 142000,
  uploadedAt: 'Just now',
  overallScore: 84,
  qualitativeLabel: 'Strong',
  previousScore: 72,
  scoreDelta: 12,
  factors: [
    {
      key: 'clarity',
      name: 'Clarity of Skill Statements',
      score: 18,
      maxScore: 20,
      description: 'Action verbs and concise phrasing clearly communicate technical capability.',
      status: 'strong',
    },
    {
      key: 'metrics',
      name: 'Quantifiable Achievements',
      score: 14,
      maxScore: 20,
      description: '5 of 8 experience bullets include measurable outcomes (e.g. latency, scale).',
      status: 'good',
    },
    {
      key: 'keywords',
      name: 'Relevant Keyword Coverage',
      score: 18,
      maxScore: 20,
      description: 'Strong alignment with Full-Stack and Backend software engineering role requirements.',
      status: 'strong',
    },
    {
      key: 'structure',
      name: 'Structure & Formatting',
      score: 17,
      maxScore: 20,
      description: 'Clean reverse-chronological layout with distinct, scannable section headers.',
      status: 'strong',
    },
    {
      key: 'completeness',
      name: 'Section Completeness',
      score: 17,
      maxScore: 20,
      description: 'Contact info, experience, education, projects, and skills sections are all present.',
      status: 'strong',
    },
  ],
  skills: [
    {
      name: 'Python',
      confidence: 88,
      level: 'Advanced',
      supportLevel: 'deeply-supported',
      supportLabel: 'Mentioned with 2 supporting projects & 3 quantified experience bullets',
      evidenceNote: 'Demonstrated in backend services: reduced API latency by 35% and built ETL pipelines handling 2M+ records.',
      sources: ['Resume: Experience', 'Resume: Projects'],
      mentionsCount: 5,
    },
    {
      name: 'React',
      confidence: 92,
      level: 'Expert',
      supportLevel: 'deeply-supported',
      supportLabel: 'Backed by 4 experience bullets with performance metrics & project portfolio',
      evidenceNote: 'Primary UI framework for 2 production applications; optimized render cycles and migrated to Vite/Tailwind.',
      sources: ['Resume: Experience', 'Resume: Projects'],
      mentionsCount: 6,
    },
    {
      name: 'TypeScript',
      confidence: 85,
      level: 'Advanced',
      supportLevel: 'deeply-supported',
      supportLabel: 'Used across full-stack roles with typed API schemas',
      evidenceNote: 'Consistently applied across frontend components and Node.js microservices with strict type safety.',
      sources: ['Resume: Experience', 'Resume: Projects'],
      mentionsCount: 4,
    },
    {
      name: 'Node.js',
      confidence: 79,
      level: 'Advanced',
      supportLevel: 'supported',
      supportLabel: 'Demonstrated in 2 backend API projects with PostgreSQL integration',
      evidenceNote: 'Built RESTful endpoints and authentication middleware supporting 10k daily active users.',
      sources: ['Resume: Experience'],
      mentionsCount: 3,
    },
    {
      name: 'System Design',
      confidence: 71,
      level: 'Intermediate',
      supportLevel: 'supported',
      supportLabel: 'Mentioned in architecture bullet for distributed caching & queuing',
      evidenceNote: 'Designed event-driven worker services with Redis caching; ready for larger distributed systems.',
      sources: ['Resume: Experience', 'Assessment'],
      mentionsCount: 2,
    },
    {
      name: 'SQL',
      confidence: 68,
      level: 'Intermediate',
      supportLevel: 'supported',
      supportLabel: 'Mentioned in query optimization bullet with index tuning',
      evidenceNote: 'Wrote complex joins and query optimizations for PostgreSQL, but lacks evidence of partitioning or high-scale replication.',
      sources: ['Resume: Experience', 'Assessment'],
      mentionsCount: 2,
    },
    {
      name: 'Machine Learning',
      confidence: 42,
      level: 'Beginner',
      supportLevel: 'listed-only',
      supportLabel: 'Listed in skills section only, no supporting detail in experience or projects',
      evidenceNote: 'Claimed as a skill but not referenced in any project or work history bullet point.',
      sources: ['Resume: Skills list'],
      mentionsCount: 1,
    },
    {
      name: 'Kubernetes',
      confidence: 35,
      level: 'Beginner',
      supportLevel: 'listed-only',
      supportLabel: 'Listed only, no supporting detail',
      evidenceNote: 'Listed in your technical skills list, but no experience bullets demonstrate container orchestration.',
      sources: ['Resume: Skills list'],
      mentionsCount: 1,
    },
  ],
  suggestions: [
    {
      id: 'sug-1',
      category: 'metrics',
      title: 'Add measurable outcomes to experience bullets',
      suggestion: "Add measurable outcomes to your experience bullets (e.g. 'increased X by Y%') — 3 of your bullets currently lack numbers.",
      impact: 'High Impact',
      scorePotential: '+6 pts',
    },
    {
      id: 'sug-2',
      category: 'ungrounded-skills',
      title: 'Provide supporting evidence for Machine Learning',
      suggestion: "Your Skills section lists Machine Learning, but no project or experience bullet mentions it — add a supporting project or coursework example.",
      impact: 'High Impact',
      scorePotential: '+5 pts',
    },
    {
      id: 'sug-3',
      category: 'ungrounded-skills',
      title: 'Ground Kubernetes with container deployment details',
      suggestion: "Kubernetes is listed without context. Detail a deployment manifest, Helm chart, or cluster setup experience to back up this claim.",
      impact: 'Medium Impact',
      scorePotential: '+4 pts',
    },
    {
      id: 'sug-4',
      category: 'structure',
      title: 'Add a targeted professional summary at the top',
      suggestion: 'Your resume is missing a 2-3 line professional summary highlighting your specialization (Full-Stack Engineer with 3+ years experience).',
      impact: 'Quick Fix',
      scorePotential: '+3 pts',
    },
  ],
  summary:
    'Your resume exhibits strong technical grounding for Full-Stack and Backend positions, with solid evidence in React, Python, and TypeScript. To cross into the 90+ tier, ground your unverified skills (Machine Learning, Kubernetes) with concrete project bullet points and add quantifiable metrics to the remaining 3 experience bullets.',
};
