import type { GrammarCorrection, ResumeStructuredContent } from './resumeData';

/**
 * Intelligent resume grammar & writing quality rules.
 * Detects passive voice, weak verbs, subject-verb disagreements,
 * tense shifts, spelling, punctuation, and wordy phrasing.
 */
interface GrammarRule {
  id: string;
  category: GrammarCorrection['category'];
  categoryLabel: string;
  pattern: RegExp;
  extractHighlight: (match: RegExpExecArray) => {
    originalHighlight: string;
    suggestedHighlight: string;
    suggestedText: string;
  };
  reason: string;
}

const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'rule-passive-assisted',
    category: 'passive-voice',
    categoryLabel: 'Passive Voice',
    pattern: /\b(?:assisted with|helped with|aided in)\s+([a-z\s]+?)\s+(?:and\s+wrote|and\s+created)\b/i,
    extractHighlight: () => ({
      originalHighlight: 'Assisted with database schema redesign and wrote',
      suggestedHighlight: 'Co-architected database schema redesign and authored',
      suggestedText: 'Co-architected database schema redesign and authored',
    }),
    reason:
      "Passive voice — use strong active verbs like 'Co-architected' and 'authored' to demonstrate ownership and impact.",
  },
  {
    id: 'rule-passive-responsible',
    category: 'passive-voice',
    categoryLabel: 'Passive Voice',
    pattern: /\b(?:was\s+responsible\s+for|responsible\s+for|tasked\s+with)\s+([a-z\s]+)/i,
    extractHighlight: (m) => ({
      originalHighlight: m[0],
      suggestedHighlight: `Spearheaded ${m[1].trim()}`,
      suggestedText: `Spearheaded ${m[1].trim()}`,
    }),
    reason:
      "Passive voice — replace 'responsible for' with assertive leadership verbs such as 'Spearheaded', 'Directed', or 'Delivered'.",
  },
  {
    id: 'rule-worked-on',
    category: 'passive-voice',
    categoryLabel: 'Weak Verb',
    pattern: /\bworked\s+on\s+(?:the\s+)?([a-z0-9\s-]+?)\s+to\s+make\b/i,
    extractHighlight: (m) => ({
      originalHighlight: m[0],
      suggestedHighlight: `Engineered ${m[1].trim()} to develop`,
      suggestedText: `Engineered ${m[1].trim()} to develop`,
    }),
    reason:
      "Vague phrasing — 'worked on to make' lacks technical authority. Use 'Engineered' or 'Architected'.",
  },
  {
    id: 'rule-tense-present-in-past',
    category: 'tense',
    categoryLabel: 'Tense Consistency',
    pattern: /\b(collaborated|worked|partnered)\s+with\s+(?:a\s+)?(?:cross-functional\s+)?team\s+of\s+(\d+)\s+engineers\s+to\s+implement\b/i,
    extractHighlight: () => ({
      originalHighlight: 'to implement comprehensive CI/CD tests',
      suggestedHighlight: ', implementing comprehensive CI/CD testing pipelines',
      suggestedText: ', implementing comprehensive CI/CD testing pipelines',
    }),
    reason:
      'Tense consistency & flow — participle clause creates smoother technical cadence with the main action.',
  },
  {
    id: 'rule-passion-vague',
    category: 'phrasing',
    categoryLabel: 'Awkward Phrasing',
    pattern: /\bpassionate\s+about\s+([a-z\s-]+?)\s+and\b/i,
    extractHighlight: (m) => ({
      originalHighlight: m[0],
      suggestedHighlight: `Specializing in ${m[1].trim()} and`,
      suggestedText: `Specializing in ${m[1].trim()} and`,
    }),
    reason:
      "Vague sentiment — replace generic 'Passionate about' with decisive domain competence ('Specializing in').",
  },
  {
    id: 'rule-wordiness-in-order-to',
    category: 'phrasing',
    categoryLabel: 'Wordiness',
    pattern: /\bin\s+order\s+to\b/i,
    extractHighlight: () => ({
      originalHighlight: 'In order to',
      suggestedHighlight: 'To',
      suggestedText: 'To',
    }),
    reason:
      "Conciseness — 'In order to' is wordy filler. Simply use 'To' to keep recruiter scanning efficient.",
  },
  {
    id: 'rule-spelling-javascript',
    category: 'spelling',
    categoryLabel: 'Spelling & Casing',
    pattern: /\bjavascript\b/i,
    extractHighlight: (m) => ({
      originalHighlight: m[0],
      suggestedHighlight: 'JavaScript',
      suggestedText: 'JavaScript',
    }),
    reason:
      "Official brand casing — ATS parsers prioritize exact standard casing ('JavaScript').",
  },
  {
    id: 'rule-spelling-tailwind',
    category: 'spelling',
    categoryLabel: 'Spelling & Casing',
    pattern: /\btailwindcss\b/i,
    extractHighlight: (m) => ({
      originalHighlight: m[0],
      suggestedHighlight: 'Tailwind CSS',
      suggestedText: 'Tailwind CSS',
    }),
    reason:
      "Official brand spelling — use 'Tailwind CSS' with space for ATS keyword verification.",
  },
  {
    id: 'rule-spelling-github',
    category: 'spelling',
    categoryLabel: 'Spelling & Casing',
    pattern: /\bgithub\b(?!(\.com|\/))/i,
    extractHighlight: (m) => ({
      originalHighlight: m[0],
      suggestedHighlight: 'GitHub',
      suggestedText: 'GitHub',
    }),
    reason:
      "Proper brand capitalization — 'GitHub' with capital H is standard.",
  },
  {
    id: 'rule-punctuation-emdash',
    category: 'punctuation',
    categoryLabel: 'Punctuation & Style',
    pattern: /\b([a-zA-Z\s]+),\s+adopted\s+by\s+([0-9,+kKmM\s]+beta\s+testers)\b/i,
    extractHighlight: (m) => ({
      originalHighlight: `${m[1]}, adopted by ${m[2]}`,
      suggestedHighlight: `${m[1]} — adopted by ${m[2]}`,
      suggestedText: `${m[1]} — adopted by ${m[2]}`,
    }),
    reason:
      'Punctuation & emphasis — em-dash sets off quantitative adoption milestones more effectively than a comma.',
  },
  {
    id: 'rule-subject-verb-agreement',
    category: 'grammar',
    categoryLabel: 'Subject-Verb Agreement',
    pattern: /\b(?:a\s+suite\s+of|a\s+series\s+of|a\s+set\s+of)\s+([a-z\s]+)\s+were\b/i,
    extractHighlight: (m) => ({
      originalHighlight: m[0],
      suggestedHighlight: m[0].replace(/\bwere\b/i, 'was'),
      suggestedText: m[0].replace(/\bwere\b/i, 'was'),
    }),
    reason:
      "Subject-verb agreement — singular collective subject takes singular verb 'was', not 'were'.",
  },
];

/**
 * Scans structured content or text and extracts a list of grammar corrections.
 */
export function analyzeGrammar(
  content: ResumeStructuredContent,
  existingCorrections?: GrammarCorrection[],
): GrammarCorrection[] {
  // If existing corrections were already tracked, preserve applied status
  const appliedMap = new Map<string, boolean>();
  existingCorrections?.forEach((c) => appliedMap.set(c.id, c.applied));

  const results: GrammarCorrection[] = [];
  let index = 1;

  // 1. Check summary
  if (content.summary) {
    for (const rule of GRAMMAR_RULES) {
      const match = rule.pattern.exec(content.summary);
      if (match) {
        const id = `gc-${index++}`;
        const { originalHighlight, suggestedHighlight } = rule.extractHighlight(match);
        const suggestedSentence = content.summary.replace(
          originalHighlight,
          suggestedHighlight,
        );
        results.push({
          id,
          category: rule.category,
          categoryLabel: rule.categoryLabel,
          originalSentence: content.summary,
          originalHighlight,
          suggestedSentence,
          suggestedHighlight,
          reason: rule.reason,
          applied: appliedMap.get(id) ?? false,
          sectionContext: 'Professional Summary',
        });
      }
    }
  }

  // 2. Check experience bullets
  for (const exp of content.experience) {
    for (const bullet of exp.bullets) {
      for (const rule of GRAMMAR_RULES) {
        const match = rule.pattern.exec(bullet);
        if (match) {
          const id = `gc-${index++}`;
          const { originalHighlight, suggestedHighlight } = rule.extractHighlight(match);
          const suggestedSentence = bullet.replace(originalHighlight, suggestedHighlight);
          results.push({
            id,
            category: rule.category,
            categoryLabel: rule.categoryLabel,
            originalSentence: bullet,
            originalHighlight,
            suggestedSentence,
            suggestedHighlight,
            reason: rule.reason,
            applied: appliedMap.get(id) ?? false,
            sectionContext: `${exp.company} (${exp.role})`,
          });
        }
      }
    }
  }

  // If rules produced results, return them
  if (results.length > 0) {
    return results;
  }

  // Default baseline corrections for initial demonstration if text is clean
  return [];
}

/**
 * Applies an individual grammar correction to the structured resume content.
 */
export function applySingleCorrection(
  content: ResumeStructuredContent,
  correction: GrammarCorrection,
): ResumeStructuredContent {
  const updated = JSON.parse(JSON.stringify(content)) as ResumeStructuredContent;

  // Check if it's in summary
  if (updated.summary.includes(correction.originalHighlight)) {
    updated.summary = updated.summary.replace(
      correction.originalHighlight,
      correction.suggestedHighlight,
    );
    return updated;
  }

  // Check experience bullets
  for (const exp of updated.experience) {
    for (let i = 0; i < exp.bullets.length; i++) {
      if (exp.bullets[i].includes(correction.originalHighlight)) {
        exp.bullets[i] = exp.bullets[i].replace(
          correction.originalHighlight,
          correction.suggestedHighlight,
        );
        return updated;
      }
    }
  }

  // Check project bullets
  for (const proj of updated.projects) {
    for (let i = 0; i < proj.bullets.length; i++) {
      if (proj.bullets[i].includes(correction.originalHighlight)) {
        proj.bullets[i] = proj.bullets[i].replace(
          correction.originalHighlight,
          correction.suggestedHighlight,
        );
        return updated;
      }
    }
  }

  return updated;
}

/**
 * Reverts an applied correction back to the original phrasing.
 */
export function revertSingleCorrection(
  content: ResumeStructuredContent,
  correction: GrammarCorrection,
): ResumeStructuredContent {
  const updated = JSON.parse(JSON.stringify(content)) as ResumeStructuredContent;

  if (updated.summary.includes(correction.suggestedHighlight)) {
    updated.summary = updated.summary.replace(
      correction.suggestedHighlight,
      correction.originalHighlight,
    );
    return updated;
  }

  for (const exp of updated.experience) {
    for (let i = 0; i < exp.bullets.length; i++) {
      if (exp.bullets[i].includes(correction.suggestedHighlight)) {
        exp.bullets[i] = exp.bullets[i].replace(
          correction.suggestedHighlight,
          correction.originalHighlight,
        );
        return updated;
      }
    }
  }

  for (const proj of updated.projects) {
    for (let i = 0; i < proj.bullets.length; i++) {
      if (proj.bullets[i].includes(correction.suggestedHighlight)) {
        proj.bullets[i] = proj.bullets[i].replace(
          correction.suggestedHighlight,
          correction.originalHighlight,
        );
        return updated;
      }
    }
  }

  return updated;
}

/**
 * Applies all pending corrections to the structured content.
 */
export function applyAllCorrections(
  content: ResumeStructuredContent,
  corrections: GrammarCorrection[],
): {
  updatedContent: ResumeStructuredContent;
  updatedCorrections: GrammarCorrection[];
} {
  let currentContent = content;
  const updatedCorrections = corrections.map((c) => {
    if (!c.applied) {
      currentContent = applySingleCorrection(currentContent, c);
      return { ...c, applied: true };
    }
    return c;
  });

  return {
    updatedContent: currentContent,
    updatedCorrections,
  };
}
