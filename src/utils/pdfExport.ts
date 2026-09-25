import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Result of a PDF download attempt
 */
export interface PdfDownloadResult {
  success: boolean;
  message: string;
}

/**
 * Saves a jsPDF document or PDF Blob directly to the user's Downloads folder.
 * Works seamlessly on Android Native WebView, Android Chrome/PWA, mobile, and desktop.
 */
export async function savePdfToDevice(
  pdfDoc: jsPDF,
  filename: string,
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<PdfDownloadResult> {
  // Ensure clean, standard filename ending in .pdf
  let cleanName = filename.trim();
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName = `${cleanName}.pdf`;
  }
  // Sanitize filename for Android filesystem (no slashes, colon, etc.)
  cleanName = cleanName.replace(/[/\\?%*:|"<>]/g, '_');

  try {
    // 1. Android Native Bridge: If running in standalone Android App / WebView
    if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.savePdfToDownloads === 'function') {
      try {
        const dataUri = pdfDoc.output('datauristring');
        const base64Data = dataUri.split(',')[1] || dataUri;
        const saved = window.AndroidBridge.savePdfToDownloads(base64Data, cleanName);
        if (saved) {
          const successMsg = 'PDF downloaded successfully. Check your Downloads folder.';
          onFeedback?.(successMsg, false);
          return { success: true, message: successMsg };
        }
      } catch (nativeErr: any) {
        console.warn('Native bridge save failed, falling back to browser download:', nativeErr);
      }
    }

    // 2. Browser / PWA / Android Chrome direct download
    const pdfBlob = pdfDoc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = cleanName;
    link.setAttribute('download', cleanName);
    // CRITICAL for Android: Do NOT use target="_blank" because it triggers a new tab
    // with blob: which fails on Android DownloadManager!
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 4000);

    const successMsg = 'PDF downloaded successfully. Check your Downloads folder.';
    onFeedback?.(successMsg, false);
    return { success: true, message: successMsg };
  } catch (error: any) {
    const errorMsg = `PDF download failed: ${error?.message || 'Unable to save PDF file'}`;
    console.error('Failed to save PDF to device:', error);
    onFeedback?.(errorMsg, true);
    return { success: false, message: errorMsg };
  }
}

/**
 * Exports a DOM element (such as a single learner's report card)
 * to a crisp 1-page A4 PDF file.
 */
export async function exportElementToSinglePagePdf(
  elementId: string,
  filename: string,
  options?: {
    scale?: number;
    title?: string;
    onFeedback?: (msg: string, isError?: boolean) => void;
  }
): Promise<PdfDownloadResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    const errorMsg = `Element #${elementId} not found for PDF export`;
    console.error(errorMsg);
    options?.onFeedback?.(errorMsg, true);
    return { success: false, message: errorMsg };
  }

  try {
    // Enforce A4 proportion capture with windowWidth: 1024 and onclone styling
    const canvas = await html2canvas(element, {
      scale: options?.scale || 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1024,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.width = '794px'; // 210mm at 96 DPI
          clonedEl.style.minWidth = '794px';
          clonedEl.style.maxWidth = '794px';
          clonedEl.style.minHeight = '1120px';
          clonedEl.style.maxHeight = '1120px';
          clonedEl.style.boxSizing = 'border-box';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.border = '6px double #78350f';
        }
      },
    });

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 4; // 4mm margin for maximum A4 coverage without clipping

    const availableWidth = pageWidth - margin * 2; // 202mm
    const availableHeight = pageHeight - margin * 2; // 289mm

    const printWidth = availableWidth;
    const printHeight = availableHeight;
    const posX = margin;
    const posY = margin;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', posX, posY, printWidth, printHeight, undefined, 'FAST');

    return await savePdfToDevice(pdf, filename, options?.onFeedback);
  } catch (error: any) {
    const errorMsg = `Failed to generate PDF: ${error?.message || 'Render error'}`;
    console.error('PDF export error:', error);
    options?.onFeedback?.(errorMsg, true);
    return { success: false, message: errorMsg };
  }
}

/**
 * Exports multiple report card elements into a multi-page PDF
 * where EVERY learner is guaranteed strictly 1 page.
 */
export async function exportMultipleElementsToPdf(
  elementIds: string[],
  filename: string,
  onProgress?: (current: number, total: number) => void,
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<PdfDownloadResult> {
  if (elementIds.length === 0) {
    const msg = 'No learner report elements selected for PDF generation';
    onFeedback?.(msg, true);
    return { success: false, message: msg };
  }

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 4;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    for (let i = 0; i < elementIds.length; i++) {
      const id = elementIds[i];
      const element = document.getElementById(id);
      if (!element) continue;

      if (onProgress) {
        onProgress(i + 1, elementIds.length);
      }

      if (i > 0) {
        pdf.addPage('a4', 'p');
      }

      const canvas = await html2canvas(element, {
        scale: 1.8,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById(id);
          if (clonedEl) {
            clonedEl.style.width = '794px';
            clonedEl.style.minWidth = '794px';
            clonedEl.style.maxWidth = '794px';
            clonedEl.style.minHeight = '1120px';
            clonedEl.style.maxHeight = '1120px';
            clonedEl.style.boxSizing = 'border-box';
            clonedEl.style.margin = '0 auto';
            clonedEl.style.border = '6px double #78350f';
          }
        },
      });

      const printWidth = availableWidth;
      const printHeight = availableHeight;
      const posX = margin;
      const posY = margin;

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', posX, posY, printWidth, printHeight, undefined, 'FAST');
    }

    return await savePdfToDevice(pdf, filename, onFeedback);
  } catch (error: any) {
    const errorMsg = `Failed batch PDF export: ${error?.message || 'Processing failed'}`;
    console.error('Batch PDF export error:', error);
    onFeedback?.(errorMsg, true);
    return { success: false, message: errorMsg };
  }
}

/**
 * Creates and downloads a formatted PDF learning resource/document
 * (such as Schemes of Work, Revision Notes, or Lesson Plans)
 */
export async function generateLearningResourcePdf(
  resource: {
    title: string;
    grade: string;
    subject: string;
    category: string;
    term?: string;
    author?: string;
    date?: string;
    content: string;
    keyOutcomes?: string[];
  },
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<PdfDownloadResult> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header Bar
    doc.setFillColor(107, 20, 38); // Maroon #6b1426
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REBERWET JUNIOR SECONDARY SCHOOL', 15, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('CBC LEARNING RESOURCE & CURRICULUM MATERIAL', 15, 18);
    doc.text('P.O BOX 52-20423 SIONGIROI • KERICHO COUNTY', 15, 23);

    // Document metadata box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 33, 180, 22, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, 33, 180, 22, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(resource.title, 18, 40);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const metaLine = `Grade: ${resource.grade}  |  Subject: ${resource.subject}  |  Category: ${resource.category}  |  Term: ${resource.term || 'Term 3'}`;
    doc.text(metaLine, 18, 46);

    const authorLine = `Compiled by: ${resource.author || 'Reberwet JSS Faculty'}  |  Date: ${resource.date || 'September 2026'}`;
    doc.text(authorLine, 18, 51);

    let currentY = 62;

    // Key Learning Outcomes
    if (resource.keyOutcomes && resource.keyOutcomes.length > 0) {
      doc.setTextColor(107, 20, 38);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SPECIFIC LEARNING OUTCOMES / STRANDS:', 15, currentY);
      currentY += 6;

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      resource.keyOutcomes.forEach((outcome) => {
        doc.text(`•  ${outcome}`, 18, currentY);
        currentY += 5;
      });
      currentY += 4;
    }

    // Content body
    doc.setTextColor(107, 20, 38);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTENT & LESSON STUDY NOTES:', 15, currentY);
    currentY += 6;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const splitText = doc.splitTextToSize(resource.content, 180);
    for (let i = 0; i < splitText.length; i++) {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(splitText[i], 15, currentY);
      currentY += 5.2;
    }

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Reberwet Junior Secondary School Portal - Official Academic Resource', 15, 290);
    doc.text('CBC Junior Secondary Framework', 155, 290);

    const cleanName = resource.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanName}_Resource.pdf`;

    return await savePdfToDevice(doc, filename, onFeedback);
  } catch (error: any) {
    const errorMsg = `Resource PDF generation error: ${error?.message || 'Failed'}`;
    onFeedback?.(errorMsg, true);
    return { success: false, message: errorMsg };
  }
}

/**
 * Generates and downloads a clean, printable PDF table of learners for a specific grade or entire school.
 */
export async function generateClassLearnersPdf(
  grade: string,
  learners: Array<{
    admNo: string;
    fullName: string;
    gender: 'M' | 'F';
    guardianName?: string;
    guardianPhone?: string;
    attendanceRate: number;
    status?: string;
  }>,
  academicYear: string = '2026',
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<PdfDownloadResult> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header
    doc.setFillColor(107, 20, 38); // Maroon #6b1426
    doc.rect(0, 0, 210, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REBERWET JUNIOR SECONDARY SCHOOL', 15, 11);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL CBC CLASS REGISTER & LEARNER DIRECTORY', 15, 17);
    doc.text('P.O BOX 52-20423 SIONGIROI • KERICHO COUNTY', 15, 22);

    // Meta box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 30, 180, 14, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, 30, 180, 14, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const titleText = `${grade.toUpperCase()} OFFICIAL LEARNER REGISTER • ACADEMIC YEAR ${academicYear}`;
    doc.text(titleText, 18, 36);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Total Enrolled: ${learners.length} Learners | Date Generated: ${dateStr}`, 18, 41);

    // Table Header
    let startY = 48;
    const rowHeight = 7.5;

    doc.setFillColor(241, 245, 249);
    doc.rect(15, startY, 180, 7.5, 'F');
    doc.setDrawColor(148, 163, 184);
    doc.rect(15, startY, 180, 7.5, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 17, startY + 5);
    doc.text('ADM NO', 24, startY + 5);
    doc.text('LEARNER FULL NAME', 44, startY + 5);
    doc.text('GENDER', 105, startY + 5);
    doc.text('PARENT / GUARDIAN', 123, startY + 5);
    doc.text('ATTENDANCE', 172, startY + 5);

    startY += 7.5;

    // Table Rows
    learners.forEach((lrn, index) => {
      if (startY > 275) {
        doc.addPage();
        startY = 20;

        // Re-print table header on next page
        doc.setFillColor(241, 245, 249);
        doc.rect(15, startY, 180, 7.5, 'F');
        doc.setDrawColor(148, 163, 184);
        doc.rect(15, startY, 180, 7.5, 'S');

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('#', 17, startY + 5);
        doc.text('ADM NO', 24, startY + 5);
        doc.text('LEARNER FULL NAME', 44, startY + 5);
        doc.text('GENDER', 105, startY + 5);
        doc.text('PARENT / GUARDIAN', 123, startY + 5);
        doc.text('ATTENDANCE', 172, startY + 5);

        startY += 7.5;
      }

      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, startY, 180, rowHeight, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, startY, 180, rowHeight, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      doc.text(String(index + 1), 17, startY + 5);
      doc.setFont('courier', 'bold');
      doc.text(lrn.admNo, 24, startY + 5);

      doc.setFont('helvetica', 'bold');
      doc.text(lrn.fullName.slice(0, 32), 44, startY + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(lrn.gender === 'M' ? 'Male' : 'Female', 105, startY + 5);

      const contact = lrn.guardianPhone ? `${lrn.guardianName || 'Parent'} (${lrn.guardianPhone})` : (lrn.guardianName || '—');
      doc.text(contact.slice(0, 26), 123, startY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // green
      doc.text(`${lrn.attendanceRate}%`, 175, startY + 5);

      startY += rowHeight;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Reberwet Junior Secondary School • Ministry of Education CBC Registered', 15, 290);
    doc.text(`Official Records • ${academicYear}`, 155, 290);

    const safeGradeName = grade.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Reberwet_JSS_${safeGradeName}_Learners_List.pdf`;

    return await savePdfToDevice(doc, filename, onFeedback);
  } catch (error: any) {
    const errorMsg = `Class list PDF generation failed: ${error?.message || 'Error'}`;
    onFeedback?.(errorMsg, true);
    return { success: false, message: errorMsg };
  }
}
