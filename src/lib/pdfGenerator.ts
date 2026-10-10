import { jsPDF } from 'jspdf';
import type { ResumeStructuredContent } from './resumeData';

interface GeneratePdfOptions {
  includePhoto?: boolean;
  avatarUrl?: string | null;
}

/**
 * Generates a clean, professional, single-column ATS-friendly PDF.
 * Uses standard readable font (Helvetica), consistent line heights,
 * clear section headings, and 100% selectable vector text.
 * Fits 1 page for students/early career and 2 pages max for longer experience.
 */
export async function downloadAtsResumePdf(
  content: ResumeStructuredContent,
  options: GeneratePdfOptions = {},
): Promise<string> {
  const { includePhoto = false, avatarUrl = null } = options;

  const doc = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin;

  let y = margin;

  function checkPageBreak(requiredSpace: number) {
    if (y + requiredSpace > bottomThreshold) {
      doc.addPage();
      y = margin;
    }
  }

  // 1. Header (Name, Title, Contact Info)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);

  const nameText = (content.name || 'Candidate Name').toUpperCase();

  // If photo is included and provided, handle circular avatar
  let photoDrawn = false;
  if (includePhoto && avatarUrl) {
    try {
      const imgSize = 18; // 18mm diameter
      const imgX = pageWidth - margin - imgSize;
      const imgY = y;

      // Create a circular canvas from avatarUrl
      const circularDataUrl = await getCircularAvatarDataUrl(avatarUrl);
      if (circularDataUrl) {
        doc.addImage(circularDataUrl, 'PNG', imgX, imgY, imgSize, imgSize);
        photoDrawn = true;
      }
    } catch {
      // If photo fails to load, gracefully continue with text only
    }
  }

  const headerTextWidth = photoDrawn ? contentWidth - 22 : contentWidth;

  doc.text(nameText, margin, y + 5);
  y += 7.5;

  if (content.title) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(60, 60, 60);
    doc.text(content.title, margin, y + 2);
    y += 5.5;
  }

  // Contact line
  const contactParts = [
    content.email,
    content.phone,
    content.location,
    content.linkedin?.replace(/^https?:\/\/(www\.)?/, ''),
    content.github?.replace(/^https?:\/\/(www\.)?/, ''),
    content.portfolio?.replace(/^https?:\/\/(www\.)?/, ''),
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);

    const contactStr = contactParts.join('  •  ');
    const contactLines = doc.splitTextToSize(contactStr, headerTextWidth);
    doc.text(contactLines, margin, y + 2);
    y += contactLines.length * 3.5 + 2;
  }

  // Horizontal dividing line under header
  y += 2;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Helper for Section Headers
  function addSectionHeader(title: string) {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(25, 25, 25);
    doc.text(title.toUpperCase(), margin, y);
    y += 1.5;

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.25);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  }

  // Helper for Bullets
  function addBullet(bulletText: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(45, 45, 45);

    const bulletIndent = 4;
    const textWidth = contentWidth - bulletIndent;
    const lines = doc.splitTextToSize(bulletText, textWidth);

    checkPageBreak(lines.length * 3.8 + 1.5);

    doc.text('•', margin, y);
    doc.text(lines, margin + bulletIndent, y);
    y += lines.length * 3.8 + 1;
  }

  // 2. Professional Summary
  if (content.summary && content.summary.trim()) {
    addSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(45, 45, 45);

    const summaryLines = doc.splitTextToSize(content.summary.trim(), contentWidth);
    checkPageBreak(summaryLines.length * 3.8 + 2);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 3.8 + 4;
  }

  // 3. Work Experience
  if (content.experience && content.experience.length > 0) {
    addSectionHeader('Work Experience');

    for (const exp of content.experience) {
      checkPageBreak(10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);

      const roleCompany = `${exp.role}  —  ${exp.company}${exp.location ? `, ${exp.location}` : ''}`;
      doc.text(roleCompany, margin, y);

      if (exp.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        const periodWidth = doc.getTextWidth(exp.period);
        doc.text(exp.period, pageWidth - margin - periodWidth, y);
      }
      y += 4.5;

      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets) {
          addBullet(bullet);
        }
      }
      y += 2;
    }
  }

  // 4. Internships (Preserving user's original structure)
  if (content.internships && content.internships.length > 0) {
    addSectionHeader('Internships');

    for (const intern of content.internships) {
      checkPageBreak(10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);

      const roleCompany = `${intern.role}  —  ${intern.company}${intern.location ? `, ${intern.location}` : ''}`;
      doc.text(roleCompany, margin, y);

      if (intern.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        const periodWidth = doc.getTextWidth(intern.period);
        doc.text(intern.period, pageWidth - margin - periodWidth, y);
      }
      y += 4.5;

      if (intern.bullets && intern.bullets.length > 0) {
        for (const bullet of intern.bullets) {
          addBullet(bullet);
        }
      }
      y += 2;
    }
  }

  // 5. Projects
  if (content.projects && content.projects.length > 0) {
    addSectionHeader('Technical Projects');

    for (const proj of content.projects) {
      checkPageBreak(9);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(proj.title, margin, y);

      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        const techStr = ` | ${proj.technologies.join(', ')}`;
        const titleWidth = doc.getTextWidth(proj.title);
        doc.text(techStr, margin + titleWidth + 1, y);
      }

      if (proj.link) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        const cleanLink = proj.link.replace(/^https?:\/\//, '');
        const linkWidth = doc.getTextWidth(cleanLink);
        doc.text(cleanLink, pageWidth - margin - linkWidth, y);
      }
      y += 4.5;

      if (proj.bullets && proj.bullets.length > 0) {
        for (const bullet of proj.bullets) {
          addBullet(bullet);
        }
      }
      y += 2;
    }
  }

  // 6. Technical Skills
  if (content.skills) {
    const hasSkills =
      (content.skills.languages && content.skills.languages.length > 0) ||
      (content.skills.frameworks && content.skills.frameworks.length > 0) ||
      (content.skills.databases && content.skills.databases.length > 0) ||
      (content.skills.tools && content.skills.tools.length > 0) ||
      (content.skills.softSkills && content.skills.softSkills.length > 0);

    if (hasSkills) {
      addSectionHeader('Technical Skills');

      const skillGroups = [
        { label: 'Languages:', items: content.skills.languages },
        { label: 'Frameworks & Libraries:', items: content.skills.frameworks },
        { label: 'Databases:', items: content.skills.databases },
        { label: 'Developer Tools:', items: content.skills.tools },
        { label: 'Competencies:', items: content.skills.softSkills },
      ];

      for (const group of skillGroups) {
        if (group.items && group.items.length > 0) {
          checkPageBreak(5);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(25, 25, 25);
          doc.text(group.label, margin, y);

          const labelWidth = doc.getTextWidth(group.label) + 2;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);

          const itemsText = group.items.join(', ');
          const itemLines = doc.splitTextToSize(itemsText, contentWidth - labelWidth);

          doc.text(itemLines[0], margin + labelWidth, y);
          if (itemLines.length > 1) {
            for (let i = 1; i < itemLines.length; i++) {
              y += 3.8;
              doc.text(itemLines[i], margin + labelWidth, y);
            }
          }
          y += 4.2;
        }
      }
      y += 1.5;
    }
  }

  // 7. Education
  if (content.education && content.education.length > 0) {
    addSectionHeader('Education');

    for (const ed of content.education) {
      checkPageBreak(9);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(ed.degree, margin, y);

      if (ed.graduationDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        const dateWidth = doc.getTextWidth(ed.graduationDate);
        doc.text(ed.graduationDate, pageWidth - margin - dateWidth, y);
      }
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      const instStr = `${ed.institution}${ed.gpa ? `  (GPA: ${ed.gpa})` : ''}`;
      doc.text(instStr, margin, y);
      y += 4;

      if (ed.coursework && ed.coursework.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const cwText = `Coursework: ${ed.coursework.join(', ')}`;
        const cwLines = doc.splitTextToSize(cwText, contentWidth);
        doc.text(cwLines, margin, y);
        y += cwLines.length * 3.5;
      }
      y += 2;
    }
  }

  // 8. Certifications
  if (content.certifications && content.certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of content.certifications) {
      const certText = `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`;
      addBullet(certText);
    }
    y += 2;
  }

  // 9. Achievements / Awards
  if (content.achievements && content.achievements.length > 0) {
    addSectionHeader('Achievements & Awards');
    for (const ach of content.achievements) {
      const achText = `${ach.title}${ach.description ? ` — ${ach.description}` : ''}${ach.date ? ` (${ach.date})` : ''}`;
      addBullet(achText);
    }
    y += 2;
  }

  // 10. Custom Sections
  if (content.customSections && content.customSections.length > 0) {
    for (const sec of content.customSections) {
      addSectionHeader(sec.title);
      for (const item of sec.content) {
        addBullet(item);
      }
      y += 2;
    }
  }

  const candidateNameSafe = (content.name || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${candidateNameSafe}_Resume_Corrected.pdf`;

  doc.save(fileName);
  return fileName;
}

/**
 * Creates a circular crop of an image source for embedding in PDF.
 */
function getCircularAvatarDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size,
        );

        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
