export type RubricCategoryId =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'formatting'
  | 'keywords';

export type QualitativeScoreTier =
  | 'Needs Major Work'
  | 'Below Average'
  | 'Good'
  | 'Strong'
  | 'Excellent';

export interface ResumeRubricSection {
  id: RubricCategoryId;
  name: string;
  score: number;
  maxScore: number;
  status: 'weak' | 'moderate' | 'strong';
  statusLabel: 'Needs Improvement' | 'Moderate' | 'Strong';
  suggestions: string[];
  previousScore?: number;
  scoreDelta?: number;
}

export interface SkillToImprove {
  id: string;
  name: string;
  type: 'ungrounded' | 'missing-role-standard';
  typeLabel: 'Ungrounded Claim' | 'Missing Role Essential';
  reason: string;
  suggestedAction: string;
}

export interface PriorityFixItem {
  categoryId: RubricCategoryId;
  categoryName: string;
  currentScore: number;
  maxScore: number;
  scoreGap: number;
  urgency: 'critical' | 'high' | 'medium';
  primaryFix: string;
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

export interface GrammarCorrection {
  id: string;
  category: 'grammar' | 'spelling' | 'punctuation' | 'tense' | 'passive-voice' | 'phrasing';
  categoryLabel: string;
  originalSentence: string;
  originalHighlight: string;
  suggestedSentence: string;
  suggestedHighlight: string;
  reason: string;
  applied: boolean;
  sectionContext?: string;
}

export interface ResumeExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface ResumeProjectEntry {
  id: string;
  title: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface ResumeEducationEntry {
  id: string;
  degree: string;
  institution: string;
  graduationDate: string;
  gpa?: string;
  coursework?: string[];
}

export interface ResumeStructuredContent {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio?: string;
  summary: string;
  experience: ResumeExperienceEntry[];
  projects: ResumeProjectEntry[];
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
  };
  education: ResumeEducationEntry[];
}

export interface ResumeScoreFactor {
  key: string;
  name: string;
  score: number;
  maxScore: number;
  description: string;
  status: 'strong' | 'good' | 'needs-work';
}

export interface ResumeAnalysisData {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  overallScore: number;
  qualitativeLabel: QualitativeScoreTier;
  previousScore: number | null;
  scoreDelta: number | null;
  rubricSections: ResumeRubricSection[];
  priorityFixes: PriorityFixItem[];
  skillsToImprove: SkillToImprove[];
  skills: ResumeSkillEntry[];
  grammarCorrections: GrammarCorrection[];
  structuredContent: ResumeStructuredContent;
  rawText: string;
  // Backward compatibility factors
  factors: ResumeScoreFactor[];
  suggestions: ResumeImprovementSuggestion[];
  summary: string;
}

export function getQualitativeLabel(score: number): QualitativeScoreTier {
  if (score >= 91) return 'Excellent';
  if (score >= 76) return 'Strong';
  if (score >= 61) return 'Good';
  if (score >= 41) return 'Below Average';
  return 'Needs Major Work';
}

export function getQualitativeVariant(
  label: QualitativeScoreTier,
): 'success' | 'warning' | 'error' | 'info' {
  switch (label) {
    case 'Excellent':
      return 'success';
    case 'Strong':
      return 'info';
    case 'Good':
      return 'warning';
    case 'Below Average':
      return 'warning';
    case 'Needs Major Work':
      return 'error';
  }
}

export const emptyStructuredContent: ResumeStructuredContent = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  summary: '',
  experience: [],
  projects: [],
  skills: {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
  },
  education: [],
};

// Aliased for backwards compatibility
export const initialStructuredContent: ResumeStructuredContent = emptyStructuredContent;

export function createEmptyResumeAnalysis(
  fileName = '',
  fileSize = 0,
): ResumeAnalysisData {
  return {
    fileName: fileName || '',
    fileSize: fileSize || 0,
    uploadedAt: '',
    overallScore: 0,
    qualitativeLabel: 'Needs Major Work',
    previousScore: null,
    scoreDelta: null,
    rawText: '',
    structuredContent: { ...emptyStructuredContent },
    rubricSections: [
      {
        id: 'contact',
        name: 'Contact & Basics',
        score: 0,
        maxScore: 5,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['Add your contact information (name, email, phone, location, LinkedIn, GitHub).'],
      },
      {
        id: 'summary',
        name: 'Professional Summary',
        score: 0,
        maxScore: 10,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['Add a targeted professional summary highlighting your core expertise and value proposition.'],
      },
      {
        id: 'experience',
        name: 'Work Experience / Internships',
        score: 0,
        maxScore: 25,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['Add your professional experience or internships with quantifiable impact and action verbs.'],
      },
      {
        id: 'projects',
        name: 'Projects',
        score: 0,
        maxScore: 20,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['Add key technical projects detailing the stack used and measurable outcomes.'],
      },
      {
        id: 'skills',
        name: 'Skills Section',
        score: 0,
        maxScore: 15,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['List languages, frameworks, databases, and developer tools you actively use.'],
      },
      {
        id: 'education',
        name: 'Education',
        score: 0,
        maxScore: 10,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['Add your degree, institution, graduation date, and relevant coursework.'],
      },
      {
        id: 'formatting',
        name: 'Formatting & ATS-Readability',
        score: 0,
        maxScore: 10,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['Ensure clean single-column structure and standard section headers.'],
      },
      {
        id: 'keywords',
        name: 'Keyword & Role Alignment',
        score: 0,
        maxScore: 5,
        status: 'weak',
        statusLabel: 'Needs Improvement',
        suggestions: ['Incorporate relevant industry keywords aligned with your target role.'],
      },
    ],
    priorityFixes: [
      {
        categoryId: 'experience',
        categoryName: 'Work Experience / Internships',
        currentScore: 0,
        maxScore: 25,
        scoreGap: 25,
        urgency: 'high',
        primaryFix: 'Add your professional experience or internships with measurable outcomes.',
      },
      {
        categoryId: 'projects',
        categoryName: 'Projects',
        currentScore: 0,
        maxScore: 20,
        scoreGap: 20,
        urgency: 'high',
        primaryFix: 'Add technical projects highlighting technologies used and direct contributions.',
      },
      {
        categoryId: 'skills',
        categoryName: 'Skills Section',
        currentScore: 0,
        maxScore: 15,
        scoreGap: 15,
        urgency: 'medium',
        primaryFix: 'List core technical competencies relevant to your desired job roles.',
      },
    ],
    skillsToImprove: [],
    skills: [],
    grammarCorrections: [],
    factors: [],
    suggestions: [],
    summary: 'Upload or provide your resume to view a detailed 100-point rubric breakdown and AI recommendations.',
  };
}

export const defaultResumeAnalysis: ResumeAnalysisData = createEmptyResumeAnalysis();

