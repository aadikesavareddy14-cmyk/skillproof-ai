export interface GitHubRepo {
  id: string;
  name: string;
  description: string | null;
  language: string;
  stars: number;
  lastUpdated: string;
  technologies: string[];
  hasTests: boolean;
  hasCI: boolean;
  dependencyCount: number;
  folderDepth: number;
  readmeQuality: 'well-documented' | 'basic' | 'minimal' | 'none';
  readmeNote: string;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export interface CommitWeek {
  week: string;
  count: number;
}

export const githubRepos: GitHubRepo[] = [
  {
    id: '1',
    name: 'skillproof-ai',
    description: 'AI-powered career intelligence platform with skill verification and job matching.',
    language: 'TypeScript',
    stars: 142,
    lastUpdated: '2 days ago',
    technologies: ['React', 'Supabase', 'Tailwind CSS', 'Vite'],
    hasTests: true,
    hasCI: true,
    dependencyCount: 18,
    folderDepth: 4,
    readmeQuality: 'well-documented',
    readmeNote: 'Well-documented — explains setup, architecture, and deployment clearly with code examples.',
  },
  {
    id: '2',
    name: 'data-pipeline-toolkit',
    description: 'Collection of ETL utilities for processing large datasets with streaming support.',
    language: 'Python',
    stars: 89,
    lastUpdated: '1 week ago',
    technologies: ['FastAPI', 'Redis', 'PostgreSQL', 'Docker'],
    hasTests: true,
    hasCI: true,
    dependencyCount: 12,
    folderDepth: 5,
    readmeQuality: 'well-documented',
    readmeNote: 'Thorough README with architecture diagrams, API reference, and contribution guide.',
  },
  {
    id: '3',
    name: 'react-component-lib',
    description: 'Reusable React component library with TypeScript and Storybook.',
    language: 'TypeScript',
    stars: 56,
    lastUpdated: '3 weeks ago',
    technologies: ['React', 'TypeScript', 'Storybook', 'Jest'],
    hasTests: true,
    hasCI: false,
    dependencyCount: 15,
    folderDepth: 3,
    readmeQuality: 'basic',
    readmeNote: 'Basic README — lists components but lacks usage examples and installation steps.',
  },
  {
    id: '4',
    name: 'ml-experiments',
    description: 'Personal machine learning experiments and model training notebooks.',
    language: 'Python',
    stars: 23,
    lastUpdated: '1 month ago',
    technologies: ['PyTorch', 'NumPy', 'Pandas', 'Jupyter'],
    hasTests: false,
    hasCI: false,
    dependencyCount: 8,
    folderDepth: 2,
    readmeQuality: 'minimal',
    readmeNote: 'Minimal README — one-line description, no setup or usage instructions.',
  },
  {
    id: '5',
    name: 'go-microservice-template',
    description: 'Production-ready Go microservice template with gRPC and health checks.',
    language: 'Go',
    stars: 34,
    lastUpdated: '2 months ago',
    technologies: ['Go', 'gRPC', 'Docker', 'Kubernetes'],
    hasTests: true,
    hasCI: true,
    dependencyCount: 6,
    folderDepth: 3,
    readmeQuality: 'well-documented',
    readmeNote: 'Clear documentation with quickstart, configuration reference, and deployment notes.',
  },
  {
    id: '6',
    name: 'portfolio-site',
    description: 'Personal portfolio website built with Next.js and Tailwind.',
    language: 'TypeScript',
    stars: 12,
    lastUpdated: '3 months ago',
    technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
    hasTests: false,
    hasCI: false,
    dependencyCount: 10,
    folderDepth: 2,
    readmeQuality: 'none',
    readmeNote: 'No README provided — consider adding one to help others understand the project.',
  },
];

export const languageBreakdown: LanguageStat[] = [
  { name: 'TypeScript', percentage: 38, color: '#3178c6' },
  { name: 'Python', percentage: 27, color: '#3572A5' },
  { name: 'Go', percentage: 14, color: '#00ADD8' },
  { name: 'CSS', percentage: 9, color: '#563d7c' },
  { name: 'JavaScript', percentage: 7, color: '#f1e05a' },
  { name: 'Other', percentage: 5, color: '#a78bfa' },
];

export const commitActivity: CommitWeek[] = [
  { week: 'W1', count: 3 },
  { week: 'W2', count: 7 },
  { week: 'W3', count: 12 },
  { week: 'W4', count: 5 },
  { week: 'W5', count: 9 },
  { week: 'W6', count: 14 },
  { week: 'W7', count: 8 },
  { week: 'W8', count: 11 },
  { week: 'W9', count: 6 },
  { week: 'W10', count: 15 },
  { week: 'W11', count: 10 },
  { week: 'W12', count: 18 },
  { week: 'W13', count: 7 },
  { week: 'W14', count: 13 },
  { week: 'W15', count: 9 },
  { week: 'W16', count: 16 },
  { week: 'W17', count: 11 },
  { week: 'W18', count: 5 },
  { week: 'W19', count: 8 },
  { week: 'W20', count: 12 },
  { week: 'W21', count: 14 },
  { week: 'W22', count: 6 },
  { week: 'W23', count: 10 },
  { week: 'W24', count: 15 },
  { week: 'W25', count: 9 },
  { week: 'W26', count: 13 },
  { week: 'W27', count: 7 },
  { week: 'W28', count: 11 },
  { week: 'W29', count: 17 },
  { week: 'W30', count: 8 },
  { week: 'W31', count: 12 },
  { week: 'W32', count: 14 },
  { week: 'W33', count: 6 },
  { week: 'W34', count: 10 },
  { week: 'W35', count: 15 },
  { week: 'W36', count: 9 },
  { week: 'W37', count: 13 },
  { week: 'W38', count: 11 },
  { week: 'W39', count: 7 },
  { week: 'W40', count: 16 },
  { week: 'W41', count: 10 },
  { week: 'W42', count: 14 },
  { week: 'W43', count: 8 },
  { week: 'W44', count: 12 },
  { week: 'W45', count: 15 },
  { week: 'W46', count: 6 },
  { week: 'W47', count: 11 },
  { week: 'W48', count: 13 },
  { week: 'W49', count: 9 },
  { week: 'W50', count: 17 },
  { week: 'W51', count: 10 },
  { week: 'W52', count: 8 },
];

export const githubSummary = {
  totalRepos: 12,
  totalStars: 356,
  totalCommits: 487,
  languagesUsed: 6,
  reposWithTests: 4,
  reposWithCI: 3,
  avgDependencyCount: 11,
};
