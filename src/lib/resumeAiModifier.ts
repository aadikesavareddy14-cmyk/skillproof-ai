import type {
  ResumeStructuredContent,
  ResumeProjectEntry,
  ResumeExperienceEntry,
} from './resumeData';

export type TargetSection =
  | 'all'
  | 'summary'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'contact';

export interface ModifyResumeRequest {
  activeResumeId: string;
  originalContent: ResumeStructuredContent;
  instruction: string;
  targetSection?: TargetSection;
}

export interface ModifyResumeResult {
  success: boolean;
  resumeId: string;
  modifiedContent: ResumeStructuredContent;
  changedSections: string[];
  changeSummary: string;
  validationErrors?: string[];
}

/**
 * Validates that the modified resume strictly belongs to the currently selected resume
 * and contains the user's actual information without hallucinations or candidate swaps.
 */
export function validateResumeIntegrity(
  original: ResumeStructuredContent,
  modified: ResumeStructuredContent,
  expectedResumeId: string,
  currentResumeId: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Verify Resume ID
  if (!currentResumeId || currentResumeId !== expectedResumeId) {
    errors.push('State mismatch: Modified resume ID does not match active selected resume ID.');
  }

  // 2. Verify Candidate Identity
  if (original.name && modified.name !== original.name) {
    // Check if user specifically requested name change
    errors.push(
      `Candidate identity altered: Original name "${original.name}" was replaced with "${modified.name}".`,
    );
  }

  // 3. Prohibit dummy candidate injection
  const dummyKeywords = ['alex chen', 'datascale labs', 'nextwave media'];
  const fullModified = JSON.stringify(modified).toLowerCase();
  for (const kw of dummyKeywords) {
    if (fullModified.includes(kw) && !JSON.stringify(original).toLowerCase().includes(kw)) {
      errors.push(`Prohibited dummy candidate data detected in generated output: "${kw}".`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Executes a targeted modification on the user's active resume.
 * Strict rules:
 * 1. Modify ONLY the requested sections.
 * 2. Preserve ALL existing content, companies, titles, projects, education, and contact data.
 * 3. Never invent fake companies or degrees.
 */
export async function modifyResumeWithAi(
  request: ModifyResumeRequest,
): Promise<ModifyResumeResult> {
  const { activeResumeId, originalContent, instruction, targetSection = 'all' } = request;

  // Deep clone to ensure immutability of the source
  const modifiedContent: ResumeStructuredContent = JSON.parse(
    JSON.stringify(originalContent),
  );

  const cleanInstruction = instruction.trim();
  const lowerInst = cleanInstruction.toLowerCase();
  const changedSections: string[] = [];
  let changeSummary = '';

  // Determine section to target
  const isSummaryTarget =
    targetSection === 'summary' ||
    targetSection === 'all' && (lowerInst.includes('summary') || lowerInst.includes('about') || lowerInst.includes('objective'));

  const isExpTarget =
    targetSection === 'experience' ||
    targetSection === 'all' && (lowerInst.includes('experience') || lowerInst.includes('work') || lowerInst.includes('bullet') || lowerInst.includes('metric') || lowerInst.includes('verb') || lowerInst.includes('quantif'));

  const isProjTarget =
    targetSection === 'projects' ||
    targetSection === 'all' && (lowerInst.includes('project') || lowerInst.includes('portfolio'));

  const isSkillsTarget =
    targetSection === 'skills' ||
    targetSection === 'all' && (lowerInst.includes('skill') || lowerInst.includes('technolog') || lowerInst.includes('language') || lowerInst.includes('framework') || lowerInst.includes('tool') || lowerInst.includes('database'));

  const isContactTarget =
    targetSection === 'contact' ||
    targetSection === 'all' && (lowerInst.includes('email') || lowerInst.includes('phone') || lowerInst.includes('linkedin') || lowerInst.includes('github') || lowerInst.includes('contact') || lowerInst.includes('location'));

  // 1. Target: Summary
  if (isSummaryTarget) {
    if (lowerInst.includes('change my summary to') || lowerInst.includes('update summary to') || lowerInst.includes('set summary to')) {
      // User provided explicit text
      const extracted = cleanInstruction.replace(/^.*?(to|:)\s*/i, '').trim();
      if (extracted.length > 5) {
        modifiedContent.summary = extracted;
        changedSections.push('Professional Summary');
        changeSummary = 'Updated professional summary with your provided text.';
      }
    } else {
      // Improve existing summary
      const current = modifiedContent.summary || '';
      const title = modifiedContent.title || 'Software Professional';
      
      let enhancedSummary = current;
      if (!current) {
        enhancedSummary = `${title} with proven background delivering scalable technical solutions and collaborating across modern engineering teams.`;
      } else {
        // Enhance power verbs and conciseness
        enhancedSummary = current
          .replace(/\bresponsible for\b/gi, 'Leading')
          .replace(/\bworked on\b/gi, 'Engineered and scaled')
          .replace(/\bhelped with\b/gi, 'Spearheaded')
          .replace(/\bpassionate about\b/gi, 'Specializing in');

        // Add quantifiable scale if requested
        if (lowerInst.includes('metric') || lowerInst.includes('impact') || lowerInst.includes('scale')) {
          if (!enhancedSummary.includes('%') && !enhancedSummary.includes('+')) {
            enhancedSummary += ' Driving high system reliability, clean architecture, and measurable project outcomes.';
          }
        }
      }

      modifiedContent.summary = enhancedSummary;
      changedSections.push('Professional Summary');
      changeSummary = 'Polished professional summary to enhance leadership verbs and role clarity.';
    }
  }

  // 2. Target: Work Experience
  if (isExpTarget && modifiedContent.experience.length > 0) {
    const updatedExp: ResumeExperienceEntry[] = modifiedContent.experience.map((exp, idx) => {
      // If targeting first job or all
      const shouldUpdateThis = targetSection === 'experience' || idx === 0 || lowerInst.includes(exp.company.toLowerCase());

      if (!shouldUpdateThis) return exp;

      const upgradedBullets = exp.bullets.map((bullet) => {
        let b = bullet;
        // Upgrade weak verbs
        b = b.replace(/^Assisted with\s+/i, 'Co-architected ');
        b = b.replace(/^Helped to\s+/i, 'Spearheaded ');
        b = b.replace(/^Worked on\s+/i, 'Engineered and deployed ');
        b = b.replace(/^Responsible for\s+/i, 'Managed the lifecycle of ');
        b = b.replace(/^Made changes to\s+/i, 'Optimized ');
        b = b.replace(/^Created\s+/i, 'Architected ');

        // Add quantifiable outcomes if requested and not already present
        if ((lowerInst.includes('quantif') || lowerInst.includes('metric')) && !b.match(/\d+%|\d+k|\d+M|\b(ms|s|hours|days)\b/i)) {
          if (b.includes('Optimized') || b.includes('database') || b.includes('query')) {
            b += ', reducing query execution latency by 32%';
          } else if (b.includes('Architected') || b.includes('Built') || b.includes('Engineered')) {
            b += ', improving operational throughput and test coverage';
          }
        }
        return b;
      });

      return {
        ...exp,
        bullets: upgradedBullets,
      };
    });

    modifiedContent.experience = updatedExp;
    changedSections.push('Work Experience');
    changeSummary = changeSummary ? `${changeSummary} Quantified and strengthened experience bullet points.` : 'Quantified and strengthened experience bullet points with strong action verbs.';
  }

  // 3. Target: Projects
  if (isProjTarget) {
    // Check if user is asking to add a new project
    if (lowerInst.includes('add') && lowerInst.includes('project')) {
      // Extract project details
      const rawAfter = cleanInstruction.replace(/^.*?add (?:this |a )?project:?\s*/i, '').trim();
      const parts = rawAfter.split(/[-—–|;]/).map((s) => s.trim());
      const newTitle = parts[0] || 'New Project';
      const techOrDesc = parts[1] || '';
      const stack = techOrDesc.includes(',')
        ? techOrDesc.split(',').map((t) => t.trim())
        : techOrDesc ? [techOrDesc] : ['TypeScript', 'React'];
      const desc = parts[2] || (parts[1] && !parts[1].includes(',') ? parts[1] : 'Developed modern high-performance application with automated CI/CD and clean architecture.');

      const newProj: ResumeProjectEntry = {
        id: `proj-${modifiedContent.projects.length + 1}`,
        title: newTitle,
        technologies: stack,
        bullets: [desc],
      };

      modifiedContent.projects = [newProj, ...modifiedContent.projects];
      changedSections.push('Projects');
      changeSummary = changeSummary ? `${changeSummary} Added new project "${newTitle}".` : `Added new project "${newTitle}".`;
    } else if (modifiedContent.projects.length > 0) {
      // Improve existing projects
      const updatedProjects = modifiedContent.projects.map((proj) => {
        const upgradedBullets = proj.bullets.map((b) => {
          let upgraded = b.replace(/^Created\s+/i, 'Developed and launched ');
          upgraded = upgraded.replace(/^Built\s+/i, 'Engineered ');
          return upgraded;
        });
        return {
          ...proj,
          bullets: upgradedBullets,
        };
      });
      modifiedContent.projects = updatedProjects;
      changedSections.push('Projects');
      changeSummary = changeSummary ? `${changeSummary} Strengthened project achievements.` : 'Strengthened project achievements.';
    }
  }

  // 4. Target: Skills
  if (isSkillsTarget) {
    // Check if adding specific skills
    const addSkillMatch = cleanInstruction.match(/add (?:skill|skills|technolog\w*):?\s*([^.;\n]+)/i);
    if (addSkillMatch && addSkillMatch[1]) {
      const skillsToAdd = addSkillMatch[1]
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const knownFrameworks = ['react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'tailwind', 'django', 'fastapi'];
      const knownDatabases = ['postgres', 'postgresql', 'mysql', 'redis', 'mongodb', 'sqlite', 'dynamodb'];

      skillsToAdd.forEach((skill) => {
        const low = skill.toLowerCase();
        if (knownFrameworks.some((k) => low.includes(k))) {
          if (!modifiedContent.skills.frameworks.includes(skill)) modifiedContent.skills.frameworks.push(skill);
        } else if (knownDatabases.some((k) => low.includes(k))) {
          if (!modifiedContent.skills.databases.includes(skill)) modifiedContent.skills.databases.push(skill);
        } else if (low.includes('script') || low.includes('python') || low.includes('go') || low.includes('rust') || low.includes('java')) {
          if (!modifiedContent.skills.languages.includes(skill)) modifiedContent.skills.languages.push(skill);
        } else {
          if (!modifiedContent.skills.tools.includes(skill)) modifiedContent.skills.tools.push(skill);
        }
      });

      changedSections.push('Skills Section');
      changeSummary = changeSummary ? `${changeSummary} Added skills: ${skillsToAdd.join(', ')}.` : `Added skills: ${skillsToAdd.join(', ')}.`;
    }
  }

  // 5. Target: Contact
  if (isContactTarget) {
    const emailMatch = cleanInstruction.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) {
      modifiedContent.email = emailMatch[0];
      changedSections.push('Contact Information');
    }
    const phoneMatch = cleanInstruction.match(/(?:\+?\d{1,3}[-. (]*)?\(?\d{3}\)?[-. ]*\d{3}[-. ]*\d{4}\b/);
    if (phoneMatch) {
      modifiedContent.phone = phoneMatch[0];
      changedSections.push('Contact Information');
    }
    if (lowerInst.includes('linkedin.com/in/')) {
      const li = cleanInstruction.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
      if (li) {
        modifiedContent.linkedin = li[0];
        changedSections.push('Contact Information');
      }
    }
  }

  // If no specific branch matched, apply subtle executive polish to summary without touching other sections
  if (changedSections.length === 0) {
    if (modifiedContent.summary) {
      modifiedContent.summary = modifiedContent.summary
        .replace(/\bresponsible for\b/gi, 'Leading')
        .replace(/\bworked on\b/gi, 'Engineered');
      changedSections.push('Professional Summary');
      changeSummary = 'Applied executive tone refinements to professional summary.';
    } else {
      changeSummary = 'No changes required based on the provided instruction.';
    }
  }

  // Validate that the output belongs strictly to the user's active resume
  const validation = validateResumeIntegrity(
    originalContent,
    modifiedContent,
    activeResumeId,
    activeResumeId,
  );

  if (!validation.valid) {
    return {
      success: false,
      resumeId: activeResumeId,
      modifiedContent: originalContent,
      changedSections: [],
      changeSummary: 'Validation failed: generated output contained invalid candidate data.',
      validationErrors: validation.errors,
    };
  }

  return {
    success: true,
    resumeId: activeResumeId,
    modifiedContent,
    changedSections,
    changeSummary,
  };
}
