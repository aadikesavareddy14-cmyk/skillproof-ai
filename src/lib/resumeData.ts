export interface ResumeSkillEntry {
  name: string;
  evidenceNote: string;
  sources: string[];
  confidence: number;
}

export interface ResumeImprovementEntry {
  name: string;
  note: string;
  confidence: number;
}

export interface ResumeAnalysis {
  uploadedAt: string;
  fileName: string;
  skillsYouHave: ResumeSkillEntry[];
  skillsToImprove: ResumeImprovementEntry[];
  laggingNarrative: string;
}

export const resumeAnalysis: ResumeAnalysis = {
  uploadedAt: '3 days ago',
  fileName: 'resume.pdf',
  skillsYouHave: [
    {
      name: 'Python',
      evidenceNote: 'Used across 4 projects on GitHub and mentioned prominently in your resume experience section.',
      sources: ['GitHub', 'Resume'],
      confidence: 87,
    },
    {
      name: 'React',
      evidenceNote: 'Demonstrated through 3 repositories with substantial commit history and a deployed portfolio site.',
      sources: ['GitHub', 'Resume', 'Project'],
      confidence: 92,
    },
    {
      name: 'TypeScript',
      evidenceNote: 'Consistently used across your most recent projects with proper type definitions throughout.',
      sources: ['GitHub', 'Project'],
      confidence: 85,
    },
    {
      name: 'Node.js',
      evidenceNote: 'Backend work visible in 2 projects with API design and database integration patterns.',
      sources: ['GitHub', 'Resume'],
      confidence: 79,
    },
  ],
  skillsToImprove: [
    {
      name: 'Machine Learning',
      note: "You've listed Machine Learning but your GitHub shows limited ML project activity — consider building or documenting a project to back this up.",
      confidence: 42,
    },
    {
      name: 'Kubernetes',
      note: 'Mentioned in your resume skills section, but no repositories demonstrate container orchestration experience. A deployment project would strengthen this claim.',
      confidence: 35,
    },
    {
      name: 'GraphQL',
      note: 'Listed as a skill but no evidence found in your codebase or projects. Building a small API would add real evidence.',
      confidence: 28,
    },
  ],
  laggingNarrative:
    "Most roles you're matching to also expect Docker and cloud deployment experience, which isn't reflected in your GitHub activity yet. " +
    "Your system design experience is solid for mid-level roles, but senior positions typically show evidence of distributed systems work — " +
    "your projects are mostly single-service applications. Consider adding a microservices or containerized project to your portfolio. " +
    "Your SQL skills are present but could be deepened — roles requiring database optimization and schema design at scale would benefit from " +
    "a project that demonstrates complex queries, indexing strategies, or performance tuning.",
};
