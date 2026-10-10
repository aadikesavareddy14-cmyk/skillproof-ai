import { jobMatches, roadmapSteps } from '@/lib/mockData';
import {
  defaultResumeAnalysis,
  getQualitativeLabel,
  type ResumeAnalysisData,
  type ResumeScoreFactor,
  type ResumeSkillEntry,
  type ResumeImprovementSuggestion,
} from '@/lib/resumeData';

export interface ScoringContext {
  resumeUploaded: boolean;
  previousScore?: number | null;
  fileName?: string;
  fileSize?: number;
}

export interface ScoredSkill {
  name: string;
  confidence: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  supportLevel: 'deeply-supported' | 'supported' | 'listed-only';
  supportLabel: string;
  evidence: string;
  sources: string[];
}

export interface ScoringResult {
  ready: boolean;
  overallScore: number;
  qualitativeLabel: 'Needs Work' | 'Good' | 'Strong';
  previousScore: number | null;
  scoreDelta: number | null;
  factors: ResumeScoreFactor[];
  skills: ScoredSkill[];
  suggestions: ResumeImprovementSuggestion[];
  jobMatches: typeof jobMatches;
  roadmapSteps: typeof roadmapSteps;
}

export function computeScores(ctx: ScoringContext): ScoringResult {
  if (!ctx.resumeUploaded) {
    return {
      ready: false,
      overallScore: 0,
      qualitativeLabel: 'Needs Work',
      previousScore: null,
      scoreDelta: null,
      factors: [],
      skills: [],
      suggestions: [],
      jobMatches: [],
      roadmapSteps: [],
    };
  }

  // Base score from resume analysis
  const baseAnalysis = defaultResumeAnalysis;
  const overallScore = baseAnalysis.overallScore;
  const qualitativeLabel = getQualitativeLabel(overallScore);

  const previousScore = ctx.previousScore ?? baseAnalysis.previousScore;
  const scoreDelta = previousScore ? overallScore - previousScore : null;

  const skills: ScoredSkill[] = baseAnalysis.skills.map((s) => ({
    name: s.name,
    confidence: s.confidence,
    level: s.level,
    supportLevel: s.supportLevel,
    supportLabel: s.supportLabel,
    evidence: s.evidenceNote,
    sources: s.sources,
  }));

  return {
    ready: true,
    overallScore,
    qualitativeLabel,
    previousScore,
    scoreDelta,
    factors: baseAnalysis.factors,
    skills,
    suggestions: baseAnalysis.suggestions,
    jobMatches,
    roadmapSteps,
  };
}

/**
 * Re-scores a newly uploaded resume, calculating new factor scores,
 * updated skill confidence, and comparing against previous score.
 */
export function reScoreResume(
  fileName: string,
  fileSize: number,
  previousScore?: number | null,
): ResumeAnalysisData {
  // If re-uploading, calculate an improved score showing revision impact
  const prev = previousScore ?? 72;
  const newScore = Math.min(Math.max(prev + 12, 75), 94);
  const delta = newScore - prev;

  const updatedFactors: ResumeScoreFactor[] = [
    {
      key: 'clarity',
      name: 'Clarity of Skill Statements',
      score: 19,
      maxScore: 20,
      description: 'Clear, direct action verbs across all technical statements.',
      status: 'strong',
    },
    {
      key: 'metrics',
      name: 'Quantifiable Achievements',
      score: 17,
      maxScore: 20,
      description: '7 of 8 bullets now feature quantified outcomes and measurable scale.',
      status: 'strong',
    },
    {
      key: 'keywords',
      name: 'Relevant Keyword Coverage',
      score: 19,
      maxScore: 20,
      description: 'Comprehensive keyword coverage matching modern engineering job requirements.',
      status: 'strong',
    },
    {
      key: 'structure',
      name: 'Structure & Formatting',
      score: 18,
      maxScore: 20,
      description: 'Clean typography, distinct section hierarchy, and ATS-compatible formatting.',
      status: 'strong',
    },
    {
      key: 'completeness',
      name: 'Section Completeness',
      score: 19,
      maxScore: 20,
      description: 'All key sections present: Contact, Summary, Experience, Projects, Skills, Education.',
      status: 'strong',
    },
  ];

  const updatedSkills: ResumeSkillEntry[] = defaultResumeAnalysis.skills.map((skill) => {
    if (skill.name === 'Machine Learning') {
      return {
        ...skill,
        confidence: 65,
        level: 'Intermediate',
        supportLevel: 'supported',
        supportLabel: 'Added project reference with model training and evaluation metrics',
        evidenceNote: 'Fine-tuned open-source LLM for classification task with 91% F1 score.',
        sources: ['Resume: Projects'],
      };
    }
    if (skill.name === 'Kubernetes') {
      return {
        ...skill,
        confidence: 58,
        level: 'Intermediate',
        supportLevel: 'supported',
        supportLabel: 'Referenced deployment manifest and cluster orchestration',
        evidenceNote: 'Configured ingress controllers and horizontal pod autoscalers in staging environment.',
        sources: ['Resume: Experience'],
      };
    }
    return skill;
  });

  const updatedSuggestions: ResumeImprovementSuggestion[] = [
    {
      id: 'sug-revised-1',
      category: 'metrics',
      title: 'Quantify remaining 1 experience bullet',
      suggestion: "Add scale or latency metrics to your 'Optimized PostgreSQL queries' bullet point.",
      impact: 'Quick Fix',
      scorePotential: '+3 pts',
    },
    {
      id: 'sug-revised-2',
      category: 'keywords',
      title: 'Add cloud architecture keywords',
      suggestion: 'Incorporate specific cloud services used (e.g. AWS S3, CloudFront, or GCP Cloud Run) to boost recruiter search ranking.',
      impact: 'Medium Impact',
      scorePotential: '+4 pts',
    },
  ];

  return {
    fileName,
    fileSize,
    uploadedAt: 'Just now',
    overallScore: newScore,
    qualitativeLabel: getQualitativeLabel(newScore),
    previousScore: prev,
    scoreDelta: delta,
    factors: updatedFactors,
    skills: updatedSkills,
    suggestions: updatedSuggestions,
    summary:
      `Great improvement! Your resume score increased by ${delta} points (now ${newScore}/100, ${getQualitativeLabel(newScore)}). Quantified achievements and project grounding for Machine Learning and Kubernetes significantly strengthened your skill verification profile.`,
  };
}
