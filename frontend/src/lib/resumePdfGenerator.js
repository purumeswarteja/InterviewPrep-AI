import { jsPDF } from 'jspdf';

/**
 * Generates an ATS-compliant, professionally formatted PDF from optimized resume data.
 * Adheres to standard ATS formatting:
 * - Single-column top-down flow (no complex tables or sidebars that confuse parsers)
 * - Standard web-safe typography (Helvetica)
 * - Standard section headings (Summary, Technical Skills, Experience, Projects, Education)
 * - Strictly includes ONLY the user's existing skills and background
 */
export function generateOptimizedPdf(data) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter' // 612 x 792 pt
  });

  const margin = 45;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = 50;

  const checkPageBreak = (neededHeight = 25) => {
    if (y + neededHeight > 740) {
      doc.addPage();
      y = 50;
      return true;
    }
    return false;
  };

  const addSectionHeading = (title) => {
    checkPageBreak(35);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.75);
    doc.line(margin, y, margin + contentWidth, y);
    y += 12;
  };

  const addWrappedText = (text, fontSize = 9, isBold = false, indent = 0, color = [51, 65, 85]) => {
    if (!text) return;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      checkPageBreak(fontSize * 1.35);
      doc.text(line, margin + indent, y);
      y += fontSize * 1.35;
    }
  };

  // ─── 1. Header (Name & Contact) ─────────────────────────────────────────────
  const candidateName = (data.name || 'Candidate Name').trim();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text(candidateName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 15;

  if (data.contact) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(data.contact, pageWidth / 2, y, { align: 'center' });
    y += 14;
  }

  // ─── 2. Professional Summary ───────────────────────────────────────────────
  if (data.summary) {
    addSectionHeading('Professional Summary');
    addWrappedText(data.summary, 9, false, 0);
  }

  // ─── 3. Technical & Domain Skills (Only existing skills) ─────────────────────
  if (data.skills) {
    addSectionHeading('Technical & Domain Skills');
    if (Array.isArray(data.skills)) {
      addWrappedText(`• Core Skills: ${data.skills.join(', ')}`, 9, false, 6);
    } else {
      const { technical, tools, core } = data.skills;
      if (Array.isArray(technical) && technical.length > 0) {
        addWrappedText(`• Languages & Core Technologies: ${technical.join(', ')}`, 9, false, 6);
        y += 2;
      }
      if (Array.isArray(tools) && tools.length > 0) {
        addWrappedText(`• Frameworks, Libraries & Tools: ${tools.join(', ')}`, 9, false, 6);
        y += 2;
      }
      if (Array.isArray(core) && core.length > 0) {
        addWrappedText(`• Domain Concepts & Methodologies: ${core.join(', ')}`, 9, false, 6);
        y += 2;
      }
    }
  }

  // ─── 4. Professional Experience ────────────────────────────────────────────
  if (Array.isArray(data.experience) && data.experience.length > 0) {
    addSectionHeading('Professional Experience');
    data.experience.forEach((exp) => {
      checkPageBreak(35);

      // Title & Date on same line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.role || 'Software Engineer', margin, y);

      if (exp.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(exp.period, margin + contentWidth, y, { align: 'right' });
      }
      y += 12;

      // Company line
      if (exp.company) {
        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(exp.company, margin, y);
        y += 11;
      }

      // Bullets (action verb + metric)
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet) => {
          addWrappedText(`•  ${bullet}`, 8.5, false, 8);
          y += 1.5;
        });
      }
      y += 4;
    });
  }

  // ─── 5. Key Projects ───────────────────────────────────────────────────────
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    addSectionHeading('Key Projects');
    data.projects.forEach((proj) => {
      checkPageBreak(30);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(proj.title || 'Project', margin, y);

      if (proj.technologies) {
        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`[${proj.technologies}]`, margin + contentWidth, y, { align: 'right' });
      }
      y += 12;

      if (Array.isArray(proj.bullets)) {
        proj.bullets.forEach((bullet) => {
          addWrappedText(`•  ${bullet}`, 8.5, false, 8);
          y += 1.5;
        });
      }
      y += 4;
    });
  }

  // ─── 6. Education ──────────────────────────────────────────────────────────
  if (Array.isArray(data.education) && data.education.length > 0) {
    addSectionHeading('Education');
    data.education.forEach((edu) => {
      checkPageBreak(25);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const degreeText = edu.degree ? `${edu.degree}` : 'Bachelor of Technology';
      const instText = edu.institution ? ` — ${edu.institution}` : '';
      doc.text(`${degreeText}${instText}`, margin, y);

      if (edu.year) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(edu.year, margin + contentWidth, y, { align: 'right' });
      }
      y += 11;

      if (edu.details) {
        addWrappedText(edu.details, 8, false, 6, [100, 116, 139]);
      }
      y += 3;
    });
  }

  return doc;
}

/**
 * Downloads the generated PDF directly in the user's browser.
 */
export function downloadOptimizedPdf(optimizedData, baseName = 'Resume') {
  const doc = generateOptimizedPdf(optimizedData);
  const cleanName = (optimizedData.name || baseName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanName}_ATS_Optimized.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Returns a Blob of the generated PDF for programmatic text extraction or preview.
 */
export function getOptimizedPdfBlob(optimizedData) {
  const doc = generateOptimizedPdf(optimizedData);
  return doc.output('blob');
}
