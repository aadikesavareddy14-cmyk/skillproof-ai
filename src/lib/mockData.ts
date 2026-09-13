export interface SkillItem {
  name: string;
  confidence: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  sources: string[];
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  fitScore: number;
  matchType: 'strong' | 'moderate' | 'weak';
  missingSkills: string[];
  matchingSkills: number;
  totalSkills: number;
  posted: string;
}

export interface EvidenceSource {
  source: string;
  type: 'GitHub' | 'Resume' | 'Project' | 'Assessment';
  items: number;
  verified: boolean;
  icon: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  skill: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  duration: string;
  resources: number;
}

export const summaryStats = {
  skillsVerified: 47,
  jobMatches: 23,
  profileCompleteness: 82,
  assessmentsPassed: 8,
};

export const overallConfidence = 84;

export const topSkills: SkillItem[] = [
  { name: 'Python', confidence: 87, level: 'Advanced', sources: ['GitHub', 'Assessment'] },
  { name: 'React', confidence: 92, level: 'Expert', sources: ['GitHub', 'Project', 'Assessment'] },
  { name: 'TypeScript', confidence: 85, level: 'Advanced', sources: ['GitHub', 'Project'] },
  { name: 'System Design', confidence: 71, level: 'Intermediate', sources: ['Assessment'] },
  { name: 'Node.js', confidence: 79, level: 'Advanced', sources: ['GitHub', 'Project'] },
  { name: 'SQL', confidence: 68, level: 'Intermediate', sources: ['Assessment', 'Resume'] },
];

export const skillGraph = {
  nodes: [
    { id: 'core', label: 'Full-Stack', x: 200, y: 200, size: 32, color: '#3b82f6' },
    { id: 'react', label: 'React', x: 80, y: 100, size: 22, color: '#60a5fa' },
    { id: 'ts', label: 'TypeScript', x: 80, y: 300, size: 20, color: '#60a5fa' },
    { id: 'python', label: 'Python', x: 320, y: 100, size: 24, color: '#14b8a6' },
    { id: 'node', label: 'Node.js', x: 320, y: 300, size: 20, color: '#14b8a6' },
    { id: 'sql', label: 'SQL', x: 200, y: 60, size: 16, color: '#a78bfa' },
    { id: 'design', label: 'Sys Design', x: 200, y: 340, size: 18, color: '#f59e0b' },
    { id: 'docker', label: 'Docker', x: 360, y: 200, size: 16, color: '#a78bfa' },
    { id: 'aws', label: 'AWS', x: 40, y: 200, size: 16, color: '#f59e0b' },
  ],
  edges: [
    { from: 'core', to: 'react' },
    { from: 'core', to: 'ts' },
    { from: 'core', to: 'python' },
    { from: 'core', to: 'node' },
    { from: 'core', to: 'design' },
    { from: 'react', to: 'ts' },
    { from: 'python', to: 'sql' },
    { from: 'node', to: 'docker' },
    { from: 'python', to: 'aws' },
    { from: 'node', to: 'aws' },
  ],
};

export const jobMatches: JobMatch[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Engineer',
    company: 'Vercel',
    location: 'Remote',
    fitScore: 94,
    matchType: 'strong',
    missingSkills: ['GraphQL'],
    matchingSkills: 11,
    totalSkills: 12,
    posted: '2 days ago',
  },
  {
    id: '2',
    title: 'Staff Software Engineer',
    company: 'Linear',
    location: 'San Francisco, CA',
    fitScore: 88,
    matchType: 'strong',
    missingSkills: ['Rust'],
    matchingSkills: 9,
    totalSkills: 10,
    posted: '5 days ago',
  },
  {
    id: '3',
    title: 'Backend Engineer',
    company: 'Stripe',
    location: 'Remote',
    fitScore: 76,
    matchType: 'moderate',
    missingSkills: ['Go', 'Kubernetes'],
    matchingSkills: 7,
    totalSkills: 9,
    posted: '1 week ago',
  },
  {
    id: '4',
    title: 'Platform Engineer',
    company: 'Supabase',
    location: 'Remote',
    fitScore: 71,
    matchType: 'moderate',
    missingSkills: ['PostgreSQL Admin', 'Terraform'],
    matchingSkills: 6,
    totalSkills: 8,
    posted: '1 week ago',
  },
  {
    id: '5',
    title: 'ML Infrastructure Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    fitScore: 58,
    matchType: 'weak',
    missingSkills: ['PyTorch', 'CUDA', 'Distributed Training'],
    matchingSkills: 4,
    totalSkills: 7,
    posted: '3 days ago',
  },
];

export const evidenceSources: EvidenceSource[] = [
  { source: 'GitHub', type: 'GitHub', items: 12, verified: true, icon: 'github' },
  { source: 'Resume', type: 'Resume', items: 1, verified: true, icon: 'file' },
  { source: 'Projects', type: 'Project', items: 5, verified: true, icon: 'folder' },
  { source: 'Adaptive Assessments', type: 'Assessment', items: 8, verified: true, icon: 'brain' },
];

export const verificationBreakdown = [
  { skill: 'Python', github: 12, projects: 3, assessment: 87, resume: true, confidence: 87 },
  { skill: 'React', github: 8, projects: 5, assessment: 92, resume: true, confidence: 92 },
  { skill: 'TypeScript', github: 10, projects: 4, assessment: null, resume: true, confidence: 85 },
  { skill: 'System Design', github: 0, projects: 1, assessment: 71, resume: true, confidence: 71 },
  { skill: 'Node.js', github: 6, projects: 3, assessment: null, resume: true, confidence: 79 },
  { skill: 'SQL', github: 2, projects: 0, assessment: 68, resume: true, confidence: 68 },
];

export const roadmapSteps: RoadmapStep[] = [
  {
    id: '1',
    title: 'Master GraphQL fundamentals',
    description: 'Learn schema design, queries, mutations, and subscriptions to close the gap for senior full-stack roles.',
    skill: 'GraphQL',
    status: 'in-progress',
    duration: '2 weeks',
    resources: 5,
  },
  {
    id: '2',
    title: 'Advanced system design patterns',
    description: 'Study microservices, event-driven architecture, and distributed systems to boost your system design confidence.',
    skill: 'System Design',
    status: 'upcoming',
    duration: '3 weeks',
    resources: 8,
  },
  {
    id: '3',
    title: 'Container orchestration with Kubernetes',
    description: 'Learn pod management, scaling, and deployment strategies to qualify for backend and platform roles.',
    skill: 'Kubernetes',
    status: 'upcoming',
    duration: '4 weeks',
    resources: 6,
  },
  {
    id: '4',
    title: 'Rust for systems programming',
    description: 'Get started with ownership, borrowing, and lifetimes to open doors at systems-focused companies.',
    skill: 'Rust',
    status: 'upcoming',
    duration: '6 weeks',
    resources: 7,
  },
  {
    id: '5',
    title: 'Deepen PostgreSQL administration',
    description: 'Learn advanced indexing, query optimization, and replication for platform engineering roles.',
    skill: 'PostgreSQL Admin',
    status: 'upcoming',
    duration: '3 weeks',
    resources: 4,
  },
];

export const recentActivity = [
  { action: 'New job match: Senior Full-Stack Engineer at Vercel', time: '2h ago', type: 'match' },
  { action: 'Assessment completed: System Design (71%)', time: '1d ago', type: 'assessment' },
  { action: 'GitHub synced: 3 new repositories analyzed', time: '2d ago', type: 'sync' },
  { action: 'Skill profile updated: React confidence increased to 92%', time: '3d ago', type: 'update' },
  { action: 'Roadmap generated: 5 learning steps created', time: '5d ago', type: 'roadmap' },
];
