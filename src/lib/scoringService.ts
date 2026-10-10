import type { GitHubRepo } from '@/lib/githubData';
import { githubRepos } from '@/lib/githubData';
import { topSkills, jobMatches, roadmapSteps } from '@/lib/mockData';

export interface ScoringContext {
  resumeUploaded: boolean;
  githubConnected: boolean;
}

export interface ScoredSkill {
  name: string;
  confidence: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  sources: string[];
  evidence: string;
}

export interface ScoringResult {
  ready: boolean;
  overallConfidence: number;
  skills: ScoredSkill[];
  jobMatches: typeof jobMatches;
  roadmapSteps: typeof roadmapSteps;
  benchmarks: SkillBenchmark[];
}

export interface SkillBenchmark {
  skill: string;
  userRepoCount: number;
  typicalIntermediateRepos: number;
  typicalAdvancedRepos: number;
  marketContext: string;
  grounded: boolean;
}

interface BenchmarkProfile {
  intermediateRepos: number;
  advancedRepos: number;
  typicalPairings: string[];
  marketNote: string;
}

const BENCHMARK_DB: Record<string, BenchmarkProfile> = {
  Python: { intermediateRepos: 3, advancedRepos: 6, typicalPairings: ['Django', 'FastAPI', 'Pandas', 'PostgreSQL'], marketNote: 'Python roles commonly pair with web frameworks or data tooling; bare scripts rarely score above intermediate.' },
  React: { intermediateRepos: 2, advancedRepos: 5, typicalPairings: ['TypeScript', 'Next.js', 'Redux', 'Tailwind CSS'], marketNote: 'Advanced React usage typically shows state management, routing, and typed components across multiple repos.' },
  TypeScript: { intermediateRepos: 2, advancedRepos: 4, typicalPairings: ['React', 'Node.js', 'Vite', 'Express'], marketNote: 'TypeScript proficiency is measured by type depth (generics, inference) and consistency, not just repo count.' },
  'Node.js': { intermediateRepos: 2, advancedRepos: 4, typicalPairings: ['Express', 'PostgreSQL', 'Docker', 'Redis'], marketNote: 'Node.js roles expect API design and database integration evidence, not just a single server file.' },
  'System Design': { intermediateRepos: 1, advancedRepos: 3, typicalPairings: ['Microservices', 'Kubernetes', 'AWS', 'Terraform'], marketNote: 'System design is hard to verify from repos alone; assessments and multi-service architecture are key signals.' },
  SQL: { intermediateRepos: 1, advancedRepos: 3, typicalPairings: ['PostgreSQL', 'Redis', 'Docker'], marketNote: 'SQL depth is judged by schema design, indexing, and query complexity — not just presence in a config file.' },
  Docker: { intermediateRepos: 1, advancedRepos: 3, typicalPairings: ['Kubernetes', 'CI/CD', 'AWS'], marketNote: 'A single Dockerfile with no compose or orchestration does not warrant an advanced score.' },
  Go: { intermediateRepos: 2, advancedRepos: 4, typicalPairings: ['gRPC', 'Kubernetes', 'PostgreSQL'], marketNote: 'Go proficiency is shown through service architecture, testing, and concurrency patterns.' },
  GraphQL: { intermediateRepos: 1, advancedRepos: 2, typicalPairings: ['Apollo', 'PostgreSQL', 'React'], marketNote: 'GraphQL claims need schema design and resolver implementation evidence.' },
  Kubernetes: { intermediateRepos: 1, advancedRepos: 2, typicalPairings: ['Docker', 'Terraform', 'AWS'], marketNote: 'Kubernetes claims require deployment manifests, not just a mention in a README.' },
  Rust: { intermediateRepos: 1, advancedRepos: 2, typicalPairings: ['Cargo', 'Tokio', 'WebAssembly'], marketNote: 'Rust is measured by ownership/borrowing patterns and project complexity.' },
  'Machine Learning': { intermediateRepos: 2, advancedRepos: 4, typicalPairings: ['PyTorch', 'NumPy', 'Pandas', 'CUDA'], marketNote: 'ML claims need training pipelines and model evaluation, not just notebook imports.' },
  'PostgreSQL Admin': { intermediateRepos: 1, advancedRepos: 2, typicalPairings: ['Docker', 'Terraform', 'AWS'], marketNote: 'PostgreSQL administration requires replication, indexing, and tuning evidence.' },
};

function getBenchmark(skillName: string): BenchmarkProfile {
  return BENCHMARK_DB[skillName] ?? {
    intermediateRepos: 2,
    advancedRepos: 4,
    typicalPairings: [],
    marketNote: 'Benchmark data not yet available for this skill — score is based on available evidence only.',
  };
}

function countReposForSkill(skillName: string, repos: GitHubRepo[]): number {
  const lower = skillName.toLowerCase();
  return repos.filter((r) => {
    if (r.language.toLowerCase() === lower) return true;
    return r.technologies.some((t) => t.toLowerCase() === lower);
  }).length;
}

function deriveLevel(confidence: number): ScoredSkill['level'] {
  if (confidence >= 88) return 'Expert';
  if (confidence >= 75) return 'Advanced';
  if (confidence >= 60) return 'Intermediate';
  return 'Beginner';
}

function groundConfidence(
  baseConfidence: number,
  skillName: string,
  repos: GitHubRepo[],
): { confidence: number; benchmark: SkillBenchmark } {
  const benchmark = getBenchmark(skillName);
  const userRepoCount = countReposForSkill(skillName, repos);

  let grounded = baseConfidence;

  if (userRepoCount === 0 && benchmark.intermediateRepos > 0) {
    grounded = Math.min(grounded, 45);
  } else if (userRepoCount < benchmark.intermediateRepos) {
    grounded = Math.min(grounded, 65);
  } else if (userRepoCount < benchmark.advancedRepos) {
    grounded = Math.min(grounded, 80);
  }

  const hasTests = repos.some((r) =>
    r.technologies.some((t) => t.toLowerCase() === skillName.toLowerCase()) && r.hasTests,
  );
  if (hasTests && grounded < 90) grounded += 3;
  grounded = Math.min(grounded, 95);

  return {
    confidence: Math.round(grounded),
    benchmark: {
      skill: skillName,
      userRepoCount,
      typicalIntermediateRepos: benchmark.intermediateRepos,
      typicalAdvancedRepos: benchmark.advancedRepos,
      marketContext: benchmark.marketNote,
      grounded: true,
    },
  };
}

export function computeScores(ctx: ScoringContext): ScoringResult {
  if (!ctx.resumeUploaded || !ctx.githubConnected) {
    return {
      ready: false,
      overallConfidence: 0,
      skills: [],
      jobMatches: [],
      roadmapSteps: [],
      benchmarks: [],
    };
  }

  const benchmarks: SkillBenchmark[] = [];
  const skills: ScoredSkill[] = topSkills.map((skill) => {
    const { confidence, benchmark } = groundConfidence(skill.confidence, skill.name, githubRepos);
    benchmarks.push(benchmark);
    return {
      name: skill.name,
      confidence,
      level: deriveLevel(confidence),
      sources: skill.sources,
      evidence: buildEvidenceNote(skill.name, confidence, benchmark),
    };
  });

  return {
    ready: true,
    overallConfidence: Math.round(
      skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length,
    ),
    skills,
    jobMatches,
    roadmapSteps,
    benchmarks,
  };
}

function buildEvidenceNote(skillName: string, confidence: number, benchmark: SkillBenchmark): string {
  if (confidence >= 85) {
    return `${skillName} shows strong evidence across multiple repositories with real project depth. ${benchmark.marketContext}`;
  }
  if (confidence >= 70) {
    return `${skillName} has solid foundational evidence but could reach advanced with more complex projects. ${benchmark.marketContext}`;
  }
  return `${skillName} evidence is limited — ${benchmark.marketContext.toLowerCase()}`;
}


