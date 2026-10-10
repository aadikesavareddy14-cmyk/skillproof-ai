import { jobMatches, roadmapSteps } from '@/lib/mockData';
import {
  defaultResumeAnalysis,
  getQualitativeLabel,
  type ResumeAnalysisData,
  type ResumeRubricSection,
  type PriorityFixItem,
  type SkillToImprove,
  type ResumeScoreFactor,
  type ResumeImprovementSuggestion,
  type QualitativeScoreTier,
} from '@/lib/resumeData';
import { reScoreResume as engineReScore } from '@/lib/resumeScoringEngine';

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
  qualitativeLabel: QualitativeScoreTier;
  previousScore: number | null;
  scoreDelta: number | null;
  rubricSections: ResumeRubricSection[];
  priorityFixes: PriorityFixItem[];
  skillsToImprove: SkillToImprove[];
  factors: ResumeScoreFactor[];
  skills: ScoredSkill[];
  suggestions: ResumeImprovementSuggestion[];
  jobMatches: typeof jobMatches;
  roadmapSteps: typeof roadmapSteps;
}

import { resumeStore } from '@/lib/resumeStore';

export function computeScores(ctx: ScoringContext): ScoringResult {
  const activeResume = resumeStore.getActiveResume();

  if (!ctx.resumeUploaded && !activeResume) {
    return {
      ready: false,
      overallScore: 0,
      qualitativeLabel: 'Needs Major Work',
      previousScore: null,
      scoreDelta: null,
      rubricSections: [],
      priorityFixes: [],
      skillsToImprove: [],
      factors: [],
      skills: [],
      suggestions: [],
      jobMatches: [],
      roadmapSteps: [],
    };
  }

  // Base score from user's active resume analysis
  const baseAnalysis = activeResume ? activeResume.analysis : defaultResumeAnalysis;
  const overallScore = baseAnalysis.overallScore;
  const qualitativeLabel = getQualitativeLabel(overallScore);

  const previousScore = ctx.previousScore !== undefined ? ctx.previousScore : baseAnalysis.previousScore;
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
    rubricSections: baseAnalysis.rubricSections,
    priorityFixes: baseAnalysis.priorityFixes,
    skillsToImprove: baseAnalysis.skillsToImprove,
    factors: baseAnalysis.factors,
    skills,
    suggestions: baseAnalysis.suggestions,
    jobMatches,
    roadmapSteps,
  };
}

/**
 * Re-scores a newly uploaded resume, calculating new rubric scores,
 * updated skill confidence, priority fixes, and comparing against previous score.
 */
export function reScoreResume(
  fileName: string,
  fileSize: number,
  previousScore?: number | null,
  previousSections?: ResumeRubricSection[],
): ResumeAnalysisData {
  return engineReScore(fileName, fileSize, previousScore, previousSections);
}
