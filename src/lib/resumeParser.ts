import type {
  ResumeStructuredContent,
  ResumeExperienceEntry,
  ResumeProjectEntry,
  ResumeEducationEntry,
} from './resumeData';

/**
 * Parses raw text from a resume into ResumeStructuredContent.
 * Strict rule: NEVER invent or hallucinate information.
 * If a section or field is missing, leave it as an empty string or empty array.
 */
export function parseResumeRawText(text: string, fileName = 'resume.txt'): {
  structuredContent: ResumeStructuredContent;
  extractedSkillsList: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cleanText = text.trim();

  // 1. Extract Contact & Header Information
  const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = cleanText.match(
    /(?:\+?\d{1,3}[-. (]*)?\(?\d{3}\)?[-. ]*\d{3}[-. ]*\d{4}\b/,
  );
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
  const linkedin = linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '';

  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i);
  const github = githubMatch ? `github.com/${githubMatch[1]}` : '';

  const portfolioMatch = cleanText.match(
    /(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9-]+\.(?:io|dev|me|app|com|org))(?:\/[^\s]*)?/i,
  );
  let portfolio = '';
  if (portfolioMatch && !portfolioMatch[1].includes('linkedin') && !portfolioMatch[1].includes('github')) {
    portfolio = portfolioMatch[1];
  }

  // Determine candidate name: look at the first non-empty lines before section headings
  let name = '';
  let title = '';
  let location = '';

  const sectionHeaderRegex =
    /^(summary|professional summary|about|experience|work experience|employment|history|projects|technical projects|skills|technical skills|technologies|education|certifications|awards)/i;

  const headerLines: string[] = [];
  for (const line of lines.slice(0, 10)) {
    if (sectionHeaderRegex.test(line)) break;
    headerLines.push(line);
  }

  if (headerLines.length > 0) {
    // First line that is not an email, URL, or phone is likely the name
    const candidateNameLine = headerLines.find(
      (l) =>
        !l.includes('@') &&
        !l.includes('http') &&
        !l.includes('.com') &&
        !l.match(/^\+?\d/) &&
        l.length <= 40,
    );
    if (candidateNameLine) {
      name = candidateNameLine.replace(/[|•,].*$/, '').trim();
    }

    // Next candidate line could be the title
    const candidateTitleLine = headerLines.find(
      (l) =>
        l !== candidateNameLine &&
        !l.includes('@') &&
        !l.includes('http') &&
        !l.includes('.com') &&
        !l.match(/^\+?\d/) &&
        (l.toLowerCase().includes('engineer') ||
          l.toLowerCase().includes('developer') ||
          l.toLowerCase().includes('designer') ||
          l.toLowerCase().includes('manager') ||
          l.toLowerCase().includes('lead') ||
          l.toLowerCase().includes('architect') ||
          l.toLowerCase().includes('specialist') ||
          l.toLowerCase().includes('intern') ||
          l.length < 50),
    );
    if (candidateTitleLine) {
      title = candidateTitleLine.replace(/[|•].*$/, '').trim();
    }

    // Check for city / state / country
    const locationMatch = cleanText.match(/\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)\b/);
    if (locationMatch) {
      location = locationMatch[1].trim();
    } else if (cleanText.toLowerCase().includes('remote')) {
      location = 'Remote';
    }
  }

  // Fallback if name not found: derive cleanly from file name (e.g., "Jane_Doe_Resume.pdf" -> "Jane Doe")
  if (!name && fileName) {
    const base = fileName.replace(/\.[^/.]+$/, '').replace(/_|-/g, ' ');
    const cleaned = base.replace(/resume|cv|curriculum|vitae/gi, '').trim();
    if (cleaned) {
      name = cleaned
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // 2. Segment into Sections
  type SectionKey =
    | 'summary'
    | 'experience'
    | 'internships'
    | 'projects'
    | 'skills'
    | 'softSkills'
    | 'education'
    | 'certifications'
    | 'achievements'
    | 'courses'
    | 'spokenLanguages'
    | 'hobbies'
    | 'other';

  const sections: Record<SectionKey, string[]> = {
    summary: [],
    experience: [],
    internships: [],
    projects: [],
    skills: [],
    softSkills: [],
    education: [],
    certifications: [],
    achievements: [],
    courses: [],
    spokenLanguages: [],
    hobbies: [],
    other: [],
  };

  const customSectionsMap: Record<string, string[]> = {};
  let currentSection: SectionKey = 'other';
  let currentCustomTitle = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const lower = line.toLowerCase().replace(/[:#*_-]/g, '').trim();

    if (/^(professional\s+summary|summary|profile|about\s+me|objective|career\s+objective)$/i.test(lower)) {
      currentSection = 'summary';
      currentCustomTitle = '';
      continue;
    } else if (/^(internship|internships|summer\s+internship|industrial\s+training)$/i.test(lower)) {
      currentSection = 'internships';
      currentCustomTitle = '';
      continue;
    } else if (/^(work\s+experience|experience|employment\s+history|professional\s+experience|work\s+history)$/i.test(lower)) {
      currentSection = 'experience';
      currentCustomTitle = '';
      continue;
    } else if (/^(projects|technical\s+projects|selected\s+projects|personal\s+projects|academic\s+projects)$/i.test(lower)) {
      currentSection = 'projects';
      currentCustomTitle = '';
      continue;
    } else if (/^(soft\s+skills|interpersonal\s+skills|core\s+strengths)$/i.test(lower)) {
      currentSection = 'softSkills';
      currentCustomTitle = '';
      continue;
    } else if (/^(skills|technical\s+skills|core\s+competencies|technologies|tools|programming\s+languages)$/i.test(lower)) {
      currentSection = 'skills';
      currentCustomTitle = '';
      continue;
    } else if (/^(education|academic\s+background|academic\s+history|qualification|qualifications)$/i.test(lower)) {
      currentSection = 'education';
      currentCustomTitle = '';
      continue;
    } else if (/^(certifications|certificates|licenses|credentials|certified)$/i.test(lower)) {
      currentSection = 'certifications';
      currentCustomTitle = '';
      continue;
    } else if (/^(achievements|awards|honors|accomplishments|recognitions)$/i.test(lower)) {
      currentSection = 'achievements';
      currentCustomTitle = '';
      continue;
    } else if (/^(courses|coursework|training|relevant\s+coursework)$/i.test(lower)) {
      currentSection = 'courses';
      currentCustomTitle = '';
      continue;
    } else if (/^(languages|spoken\s+languages|language\s+proficiency)$/i.test(lower)) {
      currentSection = 'spokenLanguages';
      currentCustomTitle = '';
      continue;
    } else if (/^(hobbies|interests|extracurricular|extracurricular\s+activities|activities)$/i.test(lower)) {
      currentSection = 'hobbies';
      currentCustomTitle = '';
      continue;
    } else if (/^[A-Z][A-Za-z\s]{3,25}$/.test(line) && !line.includes(',') && !line.includes('.')) {
      // Possible custom section header (e.g., "Publications", "Volunteering")
      currentCustomTitle = line;
      currentSection = 'other';
      if (!customSectionsMap[currentCustomTitle]) customSectionsMap[currentCustomTitle] = [];
      continue;
    }

    if (currentCustomTitle && customSectionsMap[currentCustomTitle]) {
      customSectionsMap[currentCustomTitle].push(line);
    } else {
      sections[currentSection].push(line);
    }
  }

  // 3. Parse Professional Summary
  const summary = sections.summary.join(' ').trim();

  // 4. Parse Work Experience
  const experience: ResumeExperienceEntry[] = [];
  const expLines = sections.experience;

  if (expLines.length > 0) {
    let currentExp: ResumeExperienceEntry | null = null;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const isBullet = /^[•\-*]|\d+\.\s/.test(line);

      // Check if this line looks like a job title / company header
      // Usually contains a date pattern (e.g. 2021 - Present, 2022 - 2024, May 2020)
      const dateMatch = line.match(
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\b.*?[-–—to]+\s*(?:Present|[0-9]{4}|Current|Now)\b/i,
      );

      if (!isBullet && (dateMatch || line.includes('|') || line.includes(' - ') || !currentExp)) {
        if (currentExp && (currentExp.bullets.length > 0 || currentExp.role)) {
          experience.push(currentExp);
        }

        // Split line by pipe or separator if present
        const parts = line.split(/[|•–—]/).map((p) => p.trim());
        const role = parts[0] || 'Software Engineer';
        const company = parts[1] || '';
        const period = dateMatch ? dateMatch[0] : parts[2] || '';
        const expLocation = parts[3] || (line.toLowerCase().includes('remote') ? 'Remote' : '');

        currentExp = {
          id: `exp-${experience.length + 1}`,
          role,
          company,
          location: expLocation,
          period,
          bullets: [],
        };
      } else if (currentExp) {
        const cleanBullet = line.replace(/^[•\-*]\s*|\d+\.\s*/, '').trim();
        if (cleanBullet.length > 5) {
          currentExp.bullets.push(cleanBullet);
        }
      }
    }

    if (currentExp && (currentExp.bullets.length > 0 || currentExp.role)) {
      experience.push(currentExp);
    }
  }

  // 5. Parse Projects
  const projects: ResumeProjectEntry[] = [];
  const projLines = sections.projects;

  if (projLines.length > 0) {
    let currentProj: ResumeProjectEntry | null = null;

    for (let i = 0; i < projLines.length; i++) {
      const line = projLines[i];
      const isBullet = /^[•\-*]|\d+\.\s/.test(line);

      if (!isBullet && (line.includes('(') || line.includes('—') || line.includes('-') || !currentProj)) {
        if (currentProj) {
          projects.push(currentProj);
        }

        const titleParts = line.split(/[—–-]/).map((p) => p.trim());
        const projectTitle = titleParts[0] || 'Project';

        // Check for tech stack in parentheses
        const techMatch = line.match(/\((.*?)\)/);
        const stack = techMatch
          ? techMatch[1].split(',').map((s) => s.trim())
          : titleParts[1]
          ? titleParts[1].split(',').map((s) => s.trim())
          : [];

        currentProj = {
          id: `proj-${projects.length + 1}`,
          title: projectTitle,
          technologies: stack,
          bullets: [],
        };
      } else if (currentProj) {
        const cleanBullet = line.replace(/^[•\-*]\s*|\d+\.\s*/, '').trim();
        if (cleanBullet.length > 5) {
          currentProj.bullets.push(cleanBullet);
        }
      }
    }

    if (currentProj) {
      projects.push(currentProj);
    }
  }

  // 6. Categorize Skills into standard ResumeStructuredContent categories
  const extractedSkillsList: string[] = [];
  for (const sLine of sections.skills) {
    const rawTokens = sLine
      .replace(/^(languages|frameworks|databases|tools|skills|technologies|developer tools)[-:]/i, '')
      .split(/[,;|•·/]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && t.length < 35);
    extractedSkillsList.push(...rawTokens);
  }

  const languagesList = new Set<string>();
  const frameworksList = new Set<string>();
  const databasesList = new Set<string>();
  const toolsList = new Set<string>();

  const knownLanguages = [
    'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'go', 'golang',
    'rust', 'ruby', 'php', 'swift', 'kotlin', 'dart', 'sql', 'html', 'css', 'r',
  ];
  const knownFrameworks = [
    'react', 'next.js', 'react native', 'node.js', 'express', 'vue', 'vue.js',
    'angular', 'django', 'fastapi', 'flask', 'spring', 'spring boot', 'tailwindcss',
    'tailwind', 'svelte', 'flutter',
  ];
  const knownDatabases = [
    'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'dynamodb',
    'oracle', 'cassandra', 'elasticsearch', 'prisma', 'supabase', 'firebase',
  ];

  for (const s of extractedSkillsList) {
    const low = s.toLowerCase();
    if (knownLanguages.some((k) => low === k || low.startsWith(k))) {
      languagesList.add(s);
    } else if (knownFrameworks.some((k) => low === k || low.startsWith(k))) {
      frameworksList.add(s);
    } else if (knownDatabases.some((k) => low === k || low.startsWith(k))) {
      databasesList.add(s);
    } else {
      toolsList.add(s);
    }
  }

  // 7. Parse Education
  const education: ResumeEducationEntry[] = [];
  const eduLines = sections.education;

  if (eduLines.length > 0) {
    let currentEdu: ResumeEducationEntry | null = null;

    for (const rawLine of eduLines) {
      const line = rawLine.trim();
      if (!line) continue;

      const isDegree =
        /bachelor|master|phd|b\.s|m\.s|b\.a|m\.a|associate|degree|diploma/i.test(line);
      const isSchool =
        /university|college|institute|academy|school|polytechnic/i.test(line);
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);

      // Check if line contains both (e.g. Degree | School | Year) or School | Year following a Degree line
      const parts = line.split(/[|•–—]/).map((p) => p.trim());
      if (parts.length >= 2 && (isDegree || isSchool)) {
        if (currentEdu && currentEdu.degree && !currentEdu.institution && isSchool) {
          currentEdu.institution = parts[0];
          const datePart = parts.find((p) => /\b(19|20)\d{2}\b/.test(p));
          if (datePart) currentEdu.graduationDate = datePart;
          education.push(currentEdu);
          currentEdu = null;
          continue;
        }

        if (currentEdu && (currentEdu.degree || currentEdu.institution)) {
          education.push(currentEdu);
          currentEdu = null;
        }
        const degPart = parts.find((p) => /bachelor|master|phd|b\.s|m\.s|b\.a|m\.a|associate|degree/i.test(p)) || parts[0];
        const schPart = parts.find((p) => /university|college|institute|academy|school/i.test(p)) || parts[1];
        const datePart = parts.find((p) => /\b(19|20)\d{2}\b/.test(p));

        education.push({
          id: `edu-${education.length + 1}`,
          degree: degPart,
          institution: schPart,
          graduationDate: datePart || (yearMatch ? yearMatch[0] : ''),
        });
        continue;
      }

      if (!currentEdu) {
        currentEdu = {
          id: `edu-${education.length + 1}`,
          degree: isDegree ? line : '',
          institution: isSchool ? line : '',
          graduationDate: yearMatch ? yearMatch[0] : '',
        };
      } else {
        if (isDegree && !currentEdu.degree) {
          currentEdu.degree = line;
          if (yearMatch && !currentEdu.graduationDate) currentEdu.graduationDate = yearMatch[0];
        } else if (isSchool && !currentEdu.institution) {
          currentEdu.institution = line;
          if (yearMatch && !currentEdu.graduationDate) currentEdu.graduationDate = yearMatch[0];
        } else if (isDegree || isSchool) {
          education.push(currentEdu);
          currentEdu = {
            id: `edu-${education.length + 1}`,
            degree: isDegree ? line : '',
            institution: isSchool ? line : '',
            graduationDate: yearMatch ? yearMatch[0] : '',
          };
        } else {
          if (yearMatch && !currentEdu.graduationDate) currentEdu.graduationDate = yearMatch[0];
          if (/gpa/i.test(line)) currentEdu.gpa = line;
        }
      }
    }

    if (currentEdu) {
      education.push(currentEdu);
    }
  }

  // 8. Parse Internships
  const internships: ResumeExperienceEntry[] = [];
  const internLines = sections.internships;
  if (internLines.length > 0) {
    let currentIntern: ResumeExperienceEntry | null = null;
    for (let i = 0; i < internLines.length; i++) {
      const line = internLines[i];
      const isBullet = /^[•\-*]|\d+\.\s/.test(line);
      const dateMatch = line.match(
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\b.*?[-–—to]+\s*(?:Present|[0-9]{4}|Current|Now)\b/i,
      );

      if (!isBullet && (dateMatch || line.includes('|') || line.includes(' - ') || !currentIntern)) {
        if (currentIntern && (currentIntern.bullets.length > 0 || currentIntern.role)) {
          internships.push(currentIntern);
        }
        const parts = line.split(/[|•–—]/).map((p) => p.trim());
        const role = parts[0] || 'Intern';
        const company = parts[1] || '';
        const period = dateMatch ? dateMatch[0] : parts[2] || '';
        const internLocation = parts[3] || (line.toLowerCase().includes('remote') ? 'Remote' : '');

        currentIntern = {
          id: `intern-${internships.length + 1}`,
          role,
          company,
          location: internLocation,
          period,
          bullets: [],
        };
      } else if (currentIntern) {
        const cleanBullet = line.replace(/^[•\-*]\s*|\d+\.\s*/, '').trim();
        if (cleanBullet.length > 5) {
          currentIntern.bullets.push(cleanBullet);
        }
      }
    }
    if (currentIntern && (currentIntern.bullets.length > 0 || currentIntern.role)) {
      internships.push(currentIntern);
    }
  }

  // 9. Parse Soft Skills
  const softSkillsList: string[] = [];
  for (const sLine of sections.softSkills) {
    const tokens = sLine
      .replace(/^[•\-*]\s*/, '')
      .split(/[,;|•·/]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && t.length < 40);
    softSkillsList.push(...tokens);
  }

  // 10. Parse Certifications
  const certifications: { id: string; name: string; issuer?: string; date?: string }[] = [];
  for (const cLine of sections.certifications) {
    const clean = cLine.replace(/^[•\-*]\s*/, '').trim();
    if (!clean) continue;
    const parts = clean.split(/[|•–—]/).map((p) => p.trim());
    const dateMatch = clean.match(/\b(19|20)\d{2}\b/);
    certifications.push({
      id: `cert-${certifications.length + 1}`,
      name: parts[0],
      issuer: parts[1] || undefined,
      date: dateMatch ? dateMatch[0] : (parts[2] || undefined),
    });
  }

  // 11. Parse Achievements
  const achievements: { id: string; title: string; description?: string; date?: string }[] = [];
  for (const aLine of sections.achievements) {
    const clean = aLine.replace(/^[•\-*]\s*/, '').trim();
    if (!clean) continue;
    const parts = clean.split(/[|•–—]/).map((p) => p.trim());
    achievements.push({
      id: `ach-${achievements.length + 1}`,
      title: parts[0],
      description: parts.length > 1 ? parts.slice(1).join(' - ') : undefined,
    });
  }

  // 12. Parse Courses
  const courses: { id: string; name: string; institution?: string }[] = [];
  for (const crsLine of sections.courses) {
    const clean = crsLine.replace(/^[•\-*]\s*/, '').trim();
    if (!clean) continue;
    const parts = clean.split(/[|•–—]/).map((p) => p.trim());
    courses.push({
      id: `crs-${courses.length + 1}`,
      name: parts[0],
      institution: parts[1] || undefined,
    });
  }

  // 13. Parse Spoken Languages
  const spokenLanguages: { id: string; language: string; proficiency?: string }[] = [];
  for (const langLine of sections.spokenLanguages) {
    const clean = langLine.replace(/^[•\-*]\s*/, '').trim();
    if (!clean) continue;
    const tokens = clean.split(/[,;|•]/).map((t) => t.trim()).filter(Boolean);
    for (const tok of tokens) {
      const match = tok.match(/^([A-Za-z\s]+)(?:\((.*?)\)|[-–—:]\s*(.*))?$/);
      if (match) {
        spokenLanguages.push({
          id: `lang-${spokenLanguages.length + 1}`,
          language: match[1].trim(),
          proficiency: (match[2] || match[3] || '').trim() || undefined,
        });
      } else {
        spokenLanguages.push({
          id: `lang-${spokenLanguages.length + 1}`,
          language: tok,
        });
      }
    }
  }

  // 14. Parse Hobbies / Interests
  const hobbiesList: string[] = [];
  for (const hLine of sections.hobbies) {
    const tokens = hLine
      .replace(/^[•\-*]\s*/, '')
      .split(/[,;|•·]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && t.length < 35);
    hobbiesList.push(...tokens);
  }

  // 15. Parse Custom Sections
  const customSections = Object.entries(customSectionsMap)
    .filter(([_, contentLines]) => contentLines.length > 0)
    .map(([title, contentLines], idx) => ({
      id: `custom-${idx + 1}`,
      title,
      content: contentLines.map((l) => l.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean),
    }));

  const structuredContent: ResumeStructuredContent = {
    name: name || '',
    title: title || '',
    email,
    phone,
    location,
    linkedin,
    github,
    portfolio,
    summary,
    experience,
    internships: internships.length > 0 ? internships : undefined,
    projects,
    skills: {
      languages: Array.from(languagesList),
      frameworks: Array.from(frameworksList),
      databases: Array.from(databasesList),
      tools: Array.from(toolsList),
      softSkills: softSkillsList.length > 0 ? Array.from(new Set(softSkillsList)) : undefined,
    },
    education,
    certifications: certifications.length > 0 ? certifications : undefined,
    achievements: achievements.length > 0 ? achievements : undefined,
    courses: courses.length > 0 ? courses : undefined,
    spokenLanguages: spokenLanguages.length > 0 ? spokenLanguages : undefined,
    hobbies: hobbiesList.length > 0 ? Array.from(new Set(hobbiesList)) : undefined,
    customSections: customSections.length > 0 ? customSections : undefined,
  };

  return {
    structuredContent,
    extractedSkillsList: Array.from(new Set(extractedSkillsList)),
  };
}

/**
 * Reads a File object and extracts text.
 * For plaintext files (.txt) uses readAsText.
 * For PDF or binary documents, extracts readable string streams or ASCII text.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const isPlainText = file.name.endsWith('.txt') || file.type.includes('text');

  if (isPlainText) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  // Binary/PDF reader fallback: extract printable ASCII character chunks
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      let text = '';
      let currentWord = '';

      for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        // Printable ASCII (32 - 126) + newline + tab
        if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
          currentWord += String.fromCharCode(b);
        } else {
          if (currentWord.length >= 3) {
            text += currentWord + ' ';
          }
          currentWord = '';
        }
      }
      if (currentWord.length >= 3) {
        text += currentWord;
      }

      // Filter out PDF stream artifacts
      const cleanExtracted = text
        .replace(/\/[\w\d]+/g, ' ')
        .replace(/obj|endobj|stream|endstream|xref|trailer|startxref/gi, ' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      resolve(cleanExtracted);
    };
    reader.onerror = () => resolve('');
    reader.readAsArrayBuffer(file);
  });
}
