/**
 * Direct file downloader utility for Report Cards, Broadsheets, and Assessments.
 * Exports formatted documents directly as PDF files to device storage,
 * and downloads structured CSV data directly to user storage.
 */
import { exportElementToSinglePagePdf, PdfDownloadResult } from './pdfExport';

export interface ReportCardExportOptions {
  learnerName: string;
  admNo: string;
  grade: string;
  term: string;
  year?: string;
  documentHtml?: string;
}

/**
 * Downloads a complete, formatted PDF report card straight into the user's Downloads/Files
 * folder on Android or PC, with proper feedback and error handling.
 */
export async function downloadReportCardToFile(
  elementId: string,
  filename: string,
  options: {
    title: string;
    learnerName?: string;
    admNo?: string;
    grade?: string;
    onFeedback?: (msg: string, isError?: boolean) => void;
  }
): Promise<PdfDownloadResult> {
  const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  return await exportElementToSinglePagePdf(elementId, cleanFilename, {
    title: options.title,
    onFeedback: options.onFeedback,
  });
}

/**
 * Downloads a structured assessment summary (.csv) directly into the user's files.
 */
export function downloadCsvToFile(content: string, filename: string): { success: boolean; message: string } {
  try {
    const cleanFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = cleanFilename;
    a.setAttribute('download', cleanFilename);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2500);

    return { success: true, message: 'CSV exported successfully to Downloads folder.' };
  } catch (err: any) {
    console.error('CSV download error:', err);
    return { success: false, message: `Failed to export CSV: ${err?.message || 'Error'}` };
  }
}
