import React, { useState, useMemo, useRef } from 'react';
import { Learner, MarkEntry, UserProfile } from '../types';
import { GRADES, SCHOOL_INFO, SUBJECTS, SUBJECT_FACULTY, CLASS_TEACHERS } from '../data/initialData';
import { calculateAssessment, calculateOverallRubric } from '../utils/grading';
import { downloadReportCardToFile, downloadCsvToFile } from '../utils/fileDownloader';
import { exportElementToSinglePagePdf, exportMultipleElementsToPdf } from '../utils/pdfExport';
import { ParentSMSModal } from './ParentSMSModal';
import { WhatsAppDispatchModal } from './WhatsAppDispatchModal';
import {
  Printer,
  FileText,
  FileSpreadsheet,
  Download,
  GraduationCap,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  Stamp,
  Layers,
  Camera,
  Upload,
  UserCheck,
  FileDown,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Phone,
  Loader2,
  TrendingUp,
} from 'lucide-react';

interface PrintCenterProps {
  learners: Learner[];
  marks: MarkEntry[];
  initialGrade?: string;
  currentUser?: UserProfile;
  onShowSuccessToast: (msg: string) => void;
}

export const PrintCenter: React.FC<PrintCenterProps> = ({
  learners,
  marks,
  initialGrade = 'Grade 8',
  currentUser,
  onShowSuccessToast,
}) => {
  // Mode: single report card, bulk class report cards, or full grade broadsheet
  const [activeTab, setActiveTab] = useState<'single_report' | 'all_reports' | 'broadsheet'>('single_report');
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 3');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>('l-088');

  const ACADEMIC_YEARS = ['2026', '2027', '2028', '2029', '2030'];

  // Custom uploaded photos state (mapped by learnerId)
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // PDF Export loading state
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  // Parent SMS Modal state
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [selectedSmsLearner, setSelectedSmsLearner] = useState<Learner | null>(null);

  // Parent WhatsApp Modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedWhatsAppLearner, setSelectedWhatsAppLearner] = useState<Learner | null>(null);

  // Fallback user if not passed
  const activeUser: UserProfile = currentUser || {
    id: 'user-admin-1',
    name: 'Brian Bett',
    email: 'b.bett@reberwet.ac.ke',
    role: 'school_admin',
    phone: '+254 722 341 890',
    designation: 'School Administrator & JSS Teacher',
    assignments: [],
  };

  // Active learners in selected grade (Grade 7, Grade 8, Grade 9)
  const classLearners = useMemo(() => {
    return learners.filter(
      (l) => l.grade === selectedGrade && l.status === 'Active'
    );
  }, [learners, selectedGrade]);

  // Filtered learners for search selector
  const searchedLearners = useMemo(() => {
    if (!searchQuery.trim()) return classLearners;
    const q = searchQuery.toLowerCase().trim();
    return classLearners.filter(
      (l) => l.fullName.toLowerCase().includes(q) || l.admNo.toLowerCase().includes(q)
    );
  }, [classLearners, searchQuery]);

  // Ensure selected learner is within the active class
  React.useEffect(() => {
    if (classLearners.length > 0 && !classLearners.find((l) => l.id === selectedLearnerId)) {
      setSelectedLearnerId(classLearners[0].id);
    }
  }, [classLearners, selectedLearnerId]);

  const activeLearner = learners.find((l) => l.id === selectedLearnerId) || classLearners[0];

  // Helper to compile a learner's subject report data
  const getLearnerReportData = (lrn: Learner) => {
    const lrnMarks = marks.filter(
      (m) =>
        m.learnerId === lrn.id &&
        m.term === selectedTerm &&
        m.academicYear === selectedYear
    );

    let totalPoints = 0;
    let assessedCount = 0;
    let totalScoreSum = 0;
    let scoreCount = 0;

    const subjectRows = SUBJECTS.map((subj, idx) => {
      const entry = lrnMarks.find((m) => m.subject === subj);
      const faculty = SUBJECT_FACULTY[subj] || 'Faculty Teacher';
      
      let score: number | null = null;
      let points: number | null = null;
      let level = '—';

      if (entry) {
        if (entry.scoreOutOf100 !== null && entry.scoreOutOf100 !== undefined) {
          score = entry.scoreOutOf100;
          totalScoreSum += score;
          scoreCount++;
        }
        if (entry.points !== null && entry.points !== undefined) {
          points = entry.points;
          totalPoints += points;
          assessedCount++;
        }
        if (entry.assessmentLevel) {
          level = entry.assessmentLevel;
        }
      }

      return {
        index: idx + 1,
        subject: subj,
        faculty: faculty,
        score: score,
        points: points,
        level: level,
      };
    });

    const overall = calculateOverallRubric(totalPoints);
    const meanPercentage = scoreCount > 0 
      ? Math.round(totalScoreSum / scoreCount) 
      : (assessedCount > 0 ? Math.round((totalPoints / (assessedCount * 8)) * 100) : 0);

    return {
      learner: lrn,
      subjectRows,
      totalPoints,
      assessedCount,
      totalScoreSum,
      scoreCount,
      meanPercentage,
      overall,
    };
  };

  const currentReportData = activeLearner ? getLearnerReportData(activeLearner) : null;

  // Broadsheet sorting: learners arranged from highest total marks out of 72 descending
  const sortedBroadsheetLearners = useMemo(() => {
    return [...classLearners]
      .map((lrn) => ({
        learner: lrn,
        rep: getLearnerReportData(lrn),
      }))
      .sort((a, b) => b.rep.totalPoints - a.rep.totalPoints);
  }, [classLearners, marks, selectedTerm, selectedYear]);

  // Class Mean Calculation (out of 72 and rubric)
  const classMeanStats = useMemo(() => {
    if (sortedBroadsheetLearners.length === 0) return { meanScore: 0, meanPercentage: 0, meanRubric: calculateOverallRubric(0) };
    const sumPoints = sortedBroadsheetLearners.reduce((acc, curr) => acc + curr.rep.totalPoints, 0);
    const sumPercentages = sortedBroadsheetLearners.reduce((acc, curr) => acc + curr.rep.meanPercentage, 0);
    const mean = Math.round((sumPoints / sortedBroadsheetLearners.length) * 10) / 10;
    const meanPct = Math.round(sumPercentages / sortedBroadsheetLearners.length);
    return {
      meanScore: mean,
      meanPercentage: meanPct,
      meanRubric: calculateOverallRubric(Math.round(mean)),
    };
  }, [sortedBroadsheetLearners]);

  const BROAD_SUBJECTS = useMemo(() => [
    { key: 'Mathematics', short: 'MATH', name: 'Mathematics' },
    { key: 'English', short: 'ENG', name: 'English' },
    { key: 'Kiswahili', short: 'KISW', name: 'Kiswahili' },
    { key: 'Integrated Science', short: 'SCI', name: 'Integrated Science' },
    { key: 'Social Studies', short: 'SOC', name: 'Social Studies' },
    { key: 'Agriculture & Nutrition', short: 'AGRI', name: 'Agriculture & Nutrition' },
    { key: 'Pre-Technical Studies', short: 'P-TECH', name: 'Pre-Technical Studies' },
    { key: 'CRE (Religious Education)', short: 'CRE', name: 'CRE' },
    { key: 'Creative Arts & Sports', short: 'ARTS', name: 'Creative Arts & Sports' },
  ], []);

  // Compute Mean per Subject across all learners in broadsheet
  const subjectMeans = useMemo(() => {
    const res: Record<string, { meanScore: number; meanPoints: number; count: number; rubric: string }> = {};

    BROAD_SUBJECTS.forEach((subj) => {
      let totalPct = 0;
      let totalPts = 0;
      let assessedCount = 0;

      sortedBroadsheetLearners.forEach(({ rep }) => {
        const row = rep.subjectRows.find((r) => r.subject === subj.key);
        if (row) {
          if (row.score !== null && row.score !== undefined) {
            totalPct += row.score;
            totalPts += row.points ?? 0;
            assessedCount++;
          } else if (row.points !== null && row.points !== undefined) {
            totalPct += Math.round(row.points * 12.5);
            totalPts += row.points;
            assessedCount++;
          }
        }
      });

      const avgPct = assessedCount > 0 ? Math.round(totalPct / assessedCount) : 0;
      const avgPts = assessedCount > 0 ? Math.round((totalPts / assessedCount) * 10) / 10 : 0;

      let rubric = '—';
      if (avgPts >= 7) rubric = 'EE';
      else if (avgPts >= 5) rubric = 'ME';
      else if (avgPts >= 3) rubric = 'AE';
      else if (avgPts > 0) rubric = 'BE';

      res[subj.key] = {
        meanScore: avgPct,
        meanPoints: avgPts,
        count: assessedCount,
        rubric,
      };
    });

    return res;
  }, [sortedBroadsheetLearners, BROAD_SUBJECTS]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, targetLearnerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhotos((prev) => ({
          ...prev,
          [targetLearnerId]: reader.result as string,
        }));
        onShowSuccessToast('Learner photo uploaded successfully. Ready for download/printing.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct PDF Download (Guaranteed 1 page per learner)
  const handleDownloadPDF = async () => {
    setIsExportingPdf(true);

    if (activeTab === 'single_report' && currentReportData) {
      setPdfProgressText(`Generating 1-page PDF for ${currentReportData.learner.fullName}...`);
      const containerId = `report-card-container-${currentReportData.learner.id}`;
      const gradeStr = selectedGrade.replace(/\s+/g, '');
      const learnerClean = currentReportData.learner.fullName.replace(/\s+/g, '_');
      const fileName = `Reberwet_JSS_${gradeStr}_Report_Card_${learnerClean}.pdf`;

      const result = await exportElementToSinglePagePdf(containerId, fileName, {
        onFeedback: (msg) => onShowSuccessToast(msg),
      });
      setIsExportingPdf(false);
      setPdfProgressText('');

      if (result.success) {
        onShowSuccessToast('PDF downloaded successfully. Check your Downloads folder.');
      } else {
        onShowSuccessToast(`PDF download failed: ${result.message}`);
      }
    } else if (activeTab === 'all_reports') {
      setPdfProgressText(`Compiling 1-page report cards for all ${classLearners.length} learners...`);
      const containerIds = classLearners.map((lrn) => `report-card-container-${lrn.id}`);
      const gradeStr = selectedGrade.replace(/\s+/g, '');
      const fileName = `Reberwet_JSS_${gradeStr}_All_Report_Cards_${selectedTerm.replace(/\s+/g, '_')}_${selectedYear}.pdf`;

      const result = await exportMultipleElementsToPdf(
        containerIds,
        fileName,
        (current, total) => {
          setPdfProgressText(`Processing learner ${current} of ${total} (1 page each)...`);
        },
        (msg) => onShowSuccessToast(msg)
      );

      setIsExportingPdf(false);
      setPdfProgressText('');

      if (result.success) {
        onShowSuccessToast('PDF downloaded successfully. Check your Downloads folder.');
      } else {
        onShowSuccessToast(`PDF download failed: ${result.message}`);
      }
    } else {
      setIsExportingPdf(false);
      setPdfProgressText('');
      window.print();
    }
  };

  const handleDownloadSingleLearnerPdf = async (lrn: Learner) => {
    const containerId = `report-card-container-${lrn.id}`;
    const gradeStr = lrn.grade.replace(/\s+/g, '');
    const learnerClean = lrn.fullName.replace(/\s+/g, '_');
    const fileName = `Reberwet_JSS_${gradeStr}_Report_Card_${learnerClean}.pdf`;
    
    onShowSuccessToast(`Generating PDF for ${lrn.fullName}...`);
    const result = await exportElementToSinglePagePdf(containerId, fileName, {
      onFeedback: (msg) => onShowSuccessToast(msg),
    });
    if (result.success) {
      onShowSuccessToast('PDF downloaded successfully. Check your Downloads folder.');
    } else {
      onShowSuccessToast(`PDF download failed: ${result.message}`);
    }
  };

  const handleOpenSmsModal = (lrn?: Learner) => {
    setSelectedSmsLearner(lrn || activeLearner || null);
    setSmsModalOpen(true);
  };

  const handleOpenWhatsAppModal = (lrn?: Learner | null) => {
    setSelectedWhatsAppLearner(lrn || activeLearner || null);
    setWhatsAppModalOpen(true);
  };

  const handleDownloadDirectFile = () => {
    if (activeTab === 'broadsheet') {
      // Export broadsheet data directly as CSV file
      const headers = ['Rank', 'ADM', 'Learner Name', 'Gender', 'Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Social Studies', 'Agriculture', 'Pre-Technical', 'CRE', 'Arts', 'Total Points /72', 'Rubric Level'];
      const rows = sortedBroadsheetLearners.map((item, idx) => {
        const { learner: lrn, rep } = item;
        const math = rep.subjectRows.find((s) => s.subject === 'Mathematics')?.points ?? '';
        const eng = rep.subjectRows.find((s) => s.subject === 'English')?.points ?? '';
        const kisw = rep.subjectRows.find((s) => s.subject === 'Kiswahili')?.points ?? '';
        const sci = rep.subjectRows.find((s) => s.subject === 'Integrated Science')?.points ?? '';
        const soc = rep.subjectRows.find((s) => s.subject === 'Social Studies')?.points ?? '';
        const agri = rep.subjectRows.find((s) => s.subject === 'Agriculture & Nutrition')?.points ?? '';
        const tech = rep.subjectRows.find((s) => s.subject === 'Pre-Technical Studies')?.points ?? '';
        const cre = rep.subjectRows.find((s) => s.subject === 'CRE (Religious Education)')?.points ?? '';
        const arts = rep.subjectRows.find((s) => s.subject === 'Creative Arts & Sports')?.points ?? '';
        return [
          idx + 1,
          `"${lrn.admNo}"`,
          `"${lrn.fullName}"`,
          lrn.gender,
          math,
          eng,
          kisw,
          sci,
          soc,
          agri,
          tech,
          cre,
          arts,
          rep.totalPoints,
          `"${rep.overall.level}"`,
        ].join(',');
      });
      const meanScoreRow = [
        'MEAN %',
        '""',
        '"SUBJECT MEAN SCORE %"',
        '""',
        `${subjectMeans['Mathematics']?.meanScore ?? 0}%`,
        `${subjectMeans['English']?.meanScore ?? 0}%`,
        `${subjectMeans['Kiswahili']?.meanScore ?? 0}%`,
        `${subjectMeans['Integrated Science']?.meanScore ?? 0}%`,
        `${subjectMeans['Social Studies']?.meanScore ?? 0}%`,
        `${subjectMeans['Agriculture & Nutrition']?.meanScore ?? 0}%`,
        `${subjectMeans['Pre-Technical Studies']?.meanScore ?? 0}%`,
        `${subjectMeans['CRE (Religious Education)']?.meanScore ?? 0}%`,
        `${subjectMeans['Creative Arts & Sports']?.meanScore ?? 0}%`,
        classMeanStats.meanScore,
        `"${classMeanStats.meanRubric.level}"`,
        `""`,
      ].join(',');
      const meanPtsRow = [
        'MEAN PTS',
        '""',
        '"SUBJECT MEAN POINTS (/8)"',
        '""',
        subjectMeans['Mathematics']?.meanPoints ?? 0,
        subjectMeans['English']?.meanPoints ?? 0,
        subjectMeans['Kiswahili']?.meanPoints ?? 0,
        subjectMeans['Integrated Science']?.meanPoints ?? 0,
        subjectMeans['Social Studies']?.meanPoints ?? 0,
        subjectMeans['Agriculture & Nutrition']?.meanPoints ?? 0,
        subjectMeans['Pre-Technical Studies']?.meanPoints ?? 0,
        subjectMeans['CRE (Religious Education)']?.meanPoints ?? 0,
        subjectMeans['Creative Arts & Sports']?.meanPoints ?? 0,
        classMeanStats.meanScore,
        `"${classMeanStats.meanRubric.level}"`,
        `""`,
      ].join(',');
      const csvContent = [headers.join(','), ...rows, meanScoreRow, meanPtsRow].join('\n');
      const filename = `Broadsheet_${selectedGrade.replace(/\s+/g, '_')}_${selectedTerm.replace(/\s+/g, '_')}_${SCHOOL_INFO.currentYear}`;
      downloadCsvToFile(csvContent, filename);
      onShowSuccessToast(`Broadsheet exported directly to files as "${filename}.csv"`);
    } else {
      // Default to direct PDF export
      handleDownloadPDF();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Title & Print Controls (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-950 flex items-center gap-2">
            <Printer className="w-6 h-6 text-[#6b1426]" />
            <span>Reports &amp; Broadsheet Center</span>
          </h1>
          <p className="text-xs text-stone-600">
            CBC Learner Report Cards (Strict 1 Page per Learner in PDF), Grade Broadsheet, and SMS dispatch to parents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'single_report' && activeLearner && (
            <label className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100 shadow-2xs transition active:scale-95 cursor-pointer">
              <Upload className="w-4 h-4 text-sky-700" />
              <span>Learner Photo</span>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, activeLearner.id)}
                className="hidden"
              />
            </label>
          )}

          {/* Send via WhatsApp Button */}
          <button
            id="send-parent-whatsapp-btn"
            onClick={() => handleOpenWhatsAppModal(activeLearner)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-[#075E54] px-3.5 py-2 text-xs font-bold shadow-2xs transition active:scale-95"
            title="Connect to WhatsApp and send report card in real-time"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
            <span>Send to WhatsApp</span>
          </button>

          {/* Send SMS to Parent Button */}
          <button
            id="send-parent-sms-btn"
            onClick={() => handleOpenSmsModal(activeLearner)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-[#6b1426] px-3.5 py-2 text-xs font-bold shadow-2xs transition active:scale-95"
            title="Send report card or message to parents/guardians phone via SMS"
          >
            <Smartphone className="w-4 h-4 text-[#6b1426]" />
            <span>Send Parent SMS</span>
          </button>

          {/* Direct 1-Page PDF Download Button */}
          <button
            id="download-direct-pdf-btn"
            disabled={isExportingPdf}
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 rounded-xl bg-[#6b1426] hover:bg-[#520e1c] text-white px-3.5 py-2 text-xs font-bold shadow-2xs transition active:scale-95 disabled:opacity-50"
            title="Download report card as a 1-page PDF file"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-white" />
                <span>Download PDF (1 Page)</span>
              </>
            )}
          </button>

          {activeTab === 'broadsheet' && (
            <button
              onClick={handleDownloadDirectFile}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50 shadow-2xs transition active:scale-95"
              title="Download CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50 shadow-2xs transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Progress banner during batch PDF generation */}
      {isExportingPdf && pdfProgressText && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-[#6b1426] font-bold flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{pdfProgressText}</span>
        </div>
      )}

      {/* Filter and Mode Bar (Hidden on Print) */}
      <div className="print:hidden bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('single_report')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'single_report'
                  ? 'bg-white text-[#6b1426] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Single Report Card
            </button>

            <button
              onClick={() => setActiveTab('all_reports')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'all_reports'
                  ? 'bg-white text-[#6b1426] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Report Cards ({classLearners.length})
            </button>

            <button
              onClick={() => setActiveTab('broadsheet')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'broadsheet'
                  ? 'bg-white text-[#6b1426] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Grade Broadsheet (Mean &amp; Rank)
            </button>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Strict 1 Page per Learner • Auto-Scales for Clean A4 Output
          </div>
        </div>

        {/* Grade and Term Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
              Junior Secondary Grade
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full font-bold border border-stone-300 rounded-xl p-2.5 bg-white text-stone-800 focus:border-[#6b1426] focus:outline-none"
            >
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
              Academic Year (2026–2030)
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full font-bold border border-stone-300 rounded-xl p-2.5 bg-white text-stone-800 focus:border-[#6b1426] focus:outline-none"
            >
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  Academic Year {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
              Assessment Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as any)}
              className="w-full font-bold border border-stone-300 rounded-xl p-2.5 bg-white text-stone-800 focus:border-[#6b1426] focus:outline-none"
            >
              <option value="Term 3">Term 3 (August – November)</option>
              <option value="Term 2">Term 2 (May – August)</option>
              <option value="Term 1">Term 1 (January – April)</option>
            </select>
          </div>

          {activeTab === 'single_report' && (
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                Select Learner
              </label>
              <select
                value={selectedLearnerId}
                onChange={(e) => setSelectedLearnerId(e.target.value)}
                className="w-full font-bold border border-stone-300 rounded-xl p-2.5 bg-white text-stone-800 focus:border-[#6b1426] focus:outline-none"
              >
                {searchedLearners.map((lrn) => (
                  <option key={lrn.id} value={lrn.id}>
                    ADM {lrn.admNo} - {lrn.fullName} ({lrn.gender === 'M' ? 'Boy' : 'Girl'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SINGLE CBC REPORT CARD (Strictly 1 Page per Learner) */}
      {/* ========================================================================= */}
      {activeTab === 'single_report' && currentReportData && (
        <div className="report-card-wrapper space-y-3">
          {/* Action Toolbar strictly ABOVE the document */}
          <div className="print:hidden bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-stone-800">
              <span className="bg-rose-100 text-[#6b1426] px-2.5 py-1 rounded-md font-mono font-black">
                ADM {activeLearner.admNo}
              </span>
              <span className="text-sm font-black text-stone-900">{activeLearner.fullName}</span>
              <span className="text-stone-500 font-medium">• {activeLearner.grade}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadSingleLearnerPdf(activeLearner)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6b1426] hover:bg-[#520e1c] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF (1 Page)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSmsModal(activeLearner)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-[#6b1426] px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#6b1426]" />
                <span>Send SMS to Parent</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsAppModal(activeLearner)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-[#075E54] px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                <span>Send WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto pb-4 flex justify-center">
            <ReportCardDocument
              data={currentReportData}
              term={selectedTerm}
              academicYear={selectedYear}
              customPhoto={uploadedPhotos[currentReportData.learner.id]}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ALL REPORT CARDS (Each learner is on strictly 1 page) */}
      {/* ========================================================================= */}
      {activeTab === 'all_reports' && (
        <div id="all-reports-printable-container" className="space-y-8 print:space-y-0">
          {classLearners.map((lrn) => {
            const repData = getLearnerReportData(lrn);
            return (
              <div
                key={lrn.id}
                className="report-card-wrapper space-y-2.5 print:space-y-0 print:page-break-after-always print:break-after-page print:break-inside-avoid print:h-screen print:max-h-screen"
              >
                {/* Action Toolbar strictly ABOVE each document (hidden on print) */}
                <div className="print:hidden bg-stone-50 border border-stone-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <span className="bg-rose-100 text-[#6b1426] px-2 py-0.5 rounded font-mono font-black text-[11px]">
                      ADM {lrn.admNo}
                    </span>
                    <span className="font-black text-stone-900">{lrn.fullName}</span>
                    <span className="text-stone-500 font-medium">• {lrn.grade}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleLearnerPdf(lrn)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#6b1426] hover:bg-[#520e1c] text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition active:scale-95"
                    >
                      <FileDown className="w-3 h-3" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSmsModal(lrn)}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 hover:bg-rose-100 text-[#6b1426] px-2.5 py-1 text-[11px] font-bold transition active:scale-95"
                    >
                      <Smartphone className="w-3 h-3 text-[#6b1426]" />
                      <span>SMS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppModal(lrn)}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#075E54] px-2.5 py-1 text-[11px] font-bold transition active:scale-95"
                    >
                      <MessageCircle className="w-3 h-3 text-[#25D366] fill-current" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="w-full overflow-x-auto pb-4 flex justify-center">
                  <ReportCardDocument
                    data={repData}
                    term={selectedTerm}
                    academicYear={selectedYear}
                    customPhoto={uploadedPhotos[lrn.id]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GRADE BROADSHEET (Sorted by Total Marks out of 72 with Class Mean) */}
      {/* ========================================================================= */}
      {activeTab === 'broadsheet' && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 shadow-lg max-w-6xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-stone-950">
          {/* Broadsheet Institutional Header */}
          <div className="border-b-2 border-stone-900 pb-4 mb-4 text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
              {SCHOOL_INFO.name}
            </h2>
            <p className="text-xs font-bold text-[#6b1426] tracking-wider uppercase">
              Junior Secondary School • CBC Assessment Master Broadsheet
            </p>
            <p className="text-[11px] text-stone-600 font-medium">
              {SCHOOL_INFO.postalAddress} • Motto: <span className="italic font-serif">"{SCHOOL_INFO.motto}"</span>
            </p>
            
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold">
              <span className="bg-rose-50 text-[#6b1426] border border-rose-200 px-3 py-1 rounded-full uppercase">
                {selectedGrade} Master Ledger
              </span>
              <span className="bg-stone-100 text-stone-800 border border-stone-300 px-3 py-1 rounded-full">
                Year {SCHOOL_INFO.currentYear} • {selectedTerm}
              </span>
              <span className="bg-stone-100 text-stone-800 border border-stone-300 px-3 py-1 rounded-full">
                Learners: {sortedBroadsheetLearners.length}
              </span>
              <span className="bg-sky-100 text-sky-950 border border-sky-300 px-3 py-1 rounded-full font-black">
                Class Mean: {classMeanStats.meanScore} / 72 ({classMeanStats.meanRubric.level})
              </span>
            </div>
          </div>

          {/* Class Summary Analytics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center">
            <div className="bg-sky-50/70 border border-sky-200 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold text-sky-800 uppercase block">Total Learners</span>
              <span className="text-lg font-black text-sky-950">{sortedBroadsheetLearners.length}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold text-[#6b1426] uppercase block">Class Mean Score</span>
              <span className="text-lg font-black text-[#6b1426]">{classMeanStats.meanScore} / 72</span>
            </div>
            <div className="bg-sky-50/70 border border-sky-200 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold text-sky-800 uppercase block">Class Mean Level</span>
              <span className="text-lg font-black text-sky-950">{classMeanStats.meanRubric.level}</span>
            </div>
            <div className="bg-stone-100 border border-stone-300 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold text-stone-600 uppercase block">Top Score</span>
              <span className="text-lg font-black text-stone-900">
                {sortedBroadsheetLearners[0]?.rep.totalPoints ?? 0} / 72
              </span>
            </div>
          </div>

          {/* Subject Mean Performance Overview Bar */}
          <div className="bg-stone-50 border border-stone-300 rounded-2xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 pb-2 border-b border-stone-200">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#6b1426]" />
                <span>CBC Subject Mean Performance Summary ({selectedGrade})</span>
              </span>
              <span className="text-[11px] font-bold text-stone-600">
                Class Mean: <strong className="text-[#6b1426]">{classMeanStats.meanPercentage}%</strong> ({classMeanStats.meanScore} pts • {classMeanStats.meanRubric.level})
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 text-center text-xs">
              {BROAD_SUBJECTS.map((subj) => {
                const sData = subjectMeans[subj.key] || { meanScore: 0, meanPoints: 0, count: 0, rubric: '—' };
                return (
                  <div key={subj.key} className="bg-white border border-stone-200 rounded-xl p-2 shadow-2xs">
                    <span className="text-[9.5px] font-black text-stone-500 uppercase block truncate" title={subj.name}>
                      {subj.short}
                    </span>
                    <span className="text-sm font-mono font-black text-[#6b1426] block mt-0.5">
                      {sData.meanScore}%
                    </span>
                    <div className="flex items-center justify-center gap-1 text-[9.5px] mt-0.5 font-bold">
                      <span className="text-stone-600">{sData.meanPoints} pts</span>
                      <span className="bg-rose-100 text-[#6b1426] px-1 rounded text-[8.5px]">
                        {sData.rubric}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Broadsheet Table with Sorted Learners & Subjects */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse border border-stone-400">
              <thead className="bg-stone-100 border-b-2 border-stone-400 text-stone-900">
                <tr>
                  <th className="p-1.5 border-r border-stone-300 text-center w-8">POS</th>
                  <th className="p-1.5 border-r border-stone-300 w-12 text-center font-mono">ADM</th>
                  <th className="p-1.5 border-r border-stone-300 min-w-[130px]">LEARNER NAME</th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-8">GEN</th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="Mathematics Score %">
                    <div>MATH (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="Mathematics Mean">
                      x̄ {subjectMeans['Mathematics']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="English Score %">
                    <div>ENG (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="English Mean">
                      x̄ {subjectMeans['English']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="Kiswahili Score %">
                    <div>KISW (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="Kiswahili Mean">
                      x̄ {subjectMeans['Kiswahili']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="Integrated Science Score %">
                    <div>SCI (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="Integrated Science Mean">
                      x̄ {subjectMeans['Integrated Science']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="Social Studies Score %">
                    <div>SOC (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="Social Studies Mean">
                      x̄ {subjectMeans['Social Studies']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="Agriculture & Nutrition Score %">
                    <div>AGRI (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="Agriculture Mean">
                      x̄ {subjectMeans['Agriculture & Nutrition']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="Pre-Technical Studies Score %">
                    <div>P-TECH (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="Pre-Technical Mean">
                      x̄ {subjectMeans['Pre-Technical Studies']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="CRE Score %">
                    <div>CRE (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="CRE Mean">
                      x̄ {subjectMeans['CRE (Religious Education)']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-12" title="Creative Arts & Sports Score %">
                    <div>ARTS (%)</div>
                    <div className="text-[9px] font-mono font-black text-[#6b1426] bg-rose-50 rounded mt-0.5" title="Creative Arts Mean">
                      x̄ {subjectMeans['Creative Arts & Sports']?.meanScore ?? 0}%
                    </div>
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-14 bg-sky-50 font-black text-sky-950">
                    MEAN %
                  </th>
                  <th className="p-1.5 border-r border-stone-300 text-center w-14 bg-rose-50 font-black text-[#6b1426]">
                    TOTAL (/72)
                  </th>
                  <th className="p-1.5 text-center w-14 font-black">RUBRIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-300">
                {sortedBroadsheetLearners.map((item, idx) => {
                  const { learner: lrn, rep } = item;
                  
                  const renderSubjectCell = (subj: string) => {
                    const row = rep.subjectRows.find((r) => r.subject === subj);
                    if (!row) return <span className="text-stone-400 font-mono">—</span>;
                    if (row.score !== null && row.score !== undefined) {
                      return (
                        <div className="flex flex-col items-center leading-tight">
                          <span className="font-mono font-black text-stone-900 text-[11px]">{row.score}%</span>
                          {row.points !== null && (
                            <span className="text-[8.5px] text-stone-500 font-semibold">{row.points} pts</span>
                          )}
                        </div>
                      );
                    }
                    if (row.points !== null && row.points !== undefined) {
                      const estimatedPct = Math.round(row.points * 12.5);
                      return (
                        <div className="flex flex-col items-center leading-tight">
                          <span className="font-mono font-black text-stone-900 text-[11px]">{estimatedPct}%</span>
                          <span className="text-[8.5px] text-stone-500 font-semibold">{row.points} pts</span>
                        </div>
                      );
                    }
                    return <span className="text-stone-400 font-mono">—</span>;
                  };

                  return (
                    <tr
                      key={lrn.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50 hover:bg-stone-100'}
                    >
                      <td className="p-1.5 border-r border-stone-300 text-center font-bold text-stone-700">
                        {idx + 1}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-900">
                        {lrn.admNo}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 font-semibold text-stone-950">
                        {lrn.fullName}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center font-mono">
                        {lrn.gender}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('Mathematics')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('English')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('Kiswahili')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('Integrated Science')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('Social Studies')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('Agriculture & Nutrition')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('Pre-Technical Studies')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('CRE (Religious Education)')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center">
                        {renderSubjectCell('Creative Arts & Sports')}
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-sky-950 bg-sky-50/80">
                        {rep.meanPercentage}%
                      </td>
                      <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-[#6b1426] bg-rose-50/60">
                        {rep.totalPoints}
                      </td>
                      <td className="p-1.5 text-center font-bold text-sky-950">
                        {rep.overall.level}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer: Subject Means */}
              <tfoot className="border-t-2 border-stone-800 bg-stone-100 font-bold">
                {/* Row 1: Mean Percentage */}
                <tr className="bg-stone-100 border-b border-stone-300">
                  <td colSpan={4} className="p-2 border-r border-stone-300 text-right font-black uppercase text-stone-900 tracking-wider">
                    SUBJECT MEAN SCORE (%)
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['Mathematics']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['English']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['Kiswahili']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['Integrated Science']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['Social Studies']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['Agriculture & Nutrition']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['Pre-Technical Studies']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['CRE (Religious Education)']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-rose-950 bg-rose-50/80">
                    {subjectMeans['Creative Arts & Sports']?.meanScore ?? 0}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-sky-950 bg-sky-100">
                    {classMeanStats.meanPercentage}%
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-black text-[#6b1426] bg-rose-100">
                    {classMeanStats.meanScore}
                  </td>
                  <td className="p-1.5 text-center font-black text-stone-900 bg-stone-200">
                    {classMeanStats.meanRubric.level}
                  </td>
                </tr>

                {/* Row 2: Mean Points & Rubric Level */}
                <tr className="bg-stone-50 text-[10.5px]">
                  <td colSpan={4} className="p-2 border-r border-stone-300 text-right font-black uppercase text-stone-700">
                    SUBJECT MEAN POINTS (/8)
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['Mathematics']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['English']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['Kiswahili']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['Integrated Science']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['Social Studies']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['Agriculture & Nutrition']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['Pre-Technical Studies']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['CRE (Religious Education)']?.meanPoints ?? 0} pts
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-mono font-bold text-stone-800">
                    {subjectMeans['Creative Arts & Sports']?.meanPoints ?? 0} pts
                  </td>
                  <td colSpan={4} className="p-1.5 text-center font-bold text-stone-600 bg-stone-100">
                    Class Academic Benchmark
                  </td>
                </tr>

                {/* Row 3: CBC Assessment Level */}
                <tr className="bg-stone-100 text-[10px]">
                  <td colSpan={4} className="p-2 border-r border-stone-300 text-right font-black uppercase text-stone-800">
                    CBC ASSESSMENT LEVEL
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['Mathematics']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['English']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['Kiswahili']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['Integrated Science']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['Social Studies']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['Agriculture & Nutrition']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['Pre-Technical Studies']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['CRE (Religious Education)']?.rubric ?? '—'}
                  </td>
                  <td className="p-1.5 border-r border-stone-300 text-center font-black text-rose-900 bg-rose-50/60">
                    {subjectMeans['Creative Arts & Sports']?.rubric ?? '—'}
                  </td>
                  <td colSpan={4} className="p-1.5 text-center font-extrabold text-[#6b1426] bg-rose-100">
                    Overall: {classMeanStats.meanRubric.level}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification Sign-offs */}
          <div className="pt-6 mt-6 border-t-2 border-stone-900 flex flex-col sm:flex-row justify-between text-xs text-stone-800 gap-4">
            <div>
              Verified by Class Teacher: <strong>{CLASS_TEACHERS[selectedGrade] || 'Class Teacher'}</strong>
              <div className="mt-1">Signature: __________________________ Date: 21/09/2026</div>
            </div>
            <div>
              Approved by Head of Institution: <strong>Mr John Koech</strong>
              <div className="mt-1">Signature &amp; Stamp: __________________________</div>
            </div>
          </div>
        </div>
      )}

      {/* Parent SMS Modal */}
      <ParentSMSModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
        learners={learners}
        marks={marks}
        currentUser={activeUser}
        initialLearner={selectedSmsLearner}
        onShowSuccessToast={onShowSuccessToast}
      />
    </div>
  );
};

// ============================================================================
// COMPACT 1-PAGE CBC REPORT CARD COMPONENT (Strictly fits on 1 A4 Page)
// ============================================================================
interface ReportCardDocumentProps {
  data: {
    learner: Learner;
    subjectRows: Array<{
      index: number;
      subject: string;
      faculty: string;
      score: number | null;
      points: number | null;
      level: string;
    }>;
    totalPoints: number;
    assessedCount: number;
    overall: {
      level: string;
      name: string;
      colorClass: string;
    };
  };
  term: string;
  academicYear?: string;
  customPhoto?: string;
}

const ReportCardDocument: React.FC<ReportCardDocumentProps> = ({
  data,
  term,
  academicYear,
  customPhoto,
}) => {
  const { learner, subjectRows, totalPoints, overall } = data;
  const activePhoto = customPhoto || learner.photo;
  const classTeacherName = CLASS_TEACHERS[learner.grade] || 'Class Teacher';
  const displayYear = academicYear || SCHOOL_INFO.currentYear;

  return (
    <div
      id={`report-card-container-${learner.id}`}
      className="report-card-container bg-white p-5 sm:p-6 shadow-md mx-auto text-stone-950 font-sans flex flex-col justify-between print:m-0 print:p-4 print:h-[287mm] print:max-h-[287mm] print:break-inside-avoid print:page-break-after-always"
      style={{
        width: '202mm',
        minWidth: '764px',
        minHeight: '287mm',
        boxSizing: 'border-box',
        border: '6px double #78350f',
      }}
    >
      {/* 1. TOP HEADER: INSTITUTION DETAILS & LEARNER PHOTO AT TOP-RIGHT CORNER */}
      <div className="border-b-2 border-stone-800 pb-2">
        <div className="flex flex-row items-center justify-between gap-3">
          {/* Institutional Branding */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#6b1426] text-white shadow-2xs border border-rose-300">
              <GraduationCap className="w-8 h-8" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-black text-stone-950 uppercase tracking-tight leading-none">
                {SCHOOL_INFO.name}
              </h1>
              <p className="text-[11.5px] font-bold text-[#6b1426] uppercase tracking-wider mt-0.5">
                Junior Secondary School • CBC Assessment Report
              </p>
              <p className="text-[10px] text-stone-600 font-medium">
                {SCHOOL_INFO.postalAddress} • Motto: <span className="italic font-serif">"{SCHOOL_INFO.motto}"</span>
              </p>
              <div className="mt-1 inline-flex items-center gap-2 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded text-[9.5px] font-bold text-stone-800">
                <span>Academic Year: <strong>{displayYear}</strong></span>
                <span>•</span>
                <span className="text-[#6b1426]">Session: <strong>{term}</strong></span>
                <span>•</span>
                <span>Framework: <strong>CBC</strong></span>
              </div>
            </div>
          </div>

          {/* TOP RIGHT CORNER: LEARNER PHOTO */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="h-21 w-19 rounded-lg border-2 border-[#78350f] bg-stone-100 overflow-hidden shadow-2xs flex items-center justify-center">
              {activePhoto ? (
                <img
                  src={activePhoto}
                  alt={learner.fullName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-rose-50 text-[#6b1426]">
                  <span className="text-xl font-black">{learner.firstName.charAt(0)}{learner.lastName.charAt(0)}</span>
                  <span className="text-[8.5px] font-mono font-bold text-stone-600 mt-0.5">{learner.admNo}</span>
                </div>
              )}
            </div>
            <span className="text-[8.5px] font-black text-[#78350f] uppercase tracking-wider mt-0.5">
              Learner Photo
            </span>
          </div>
        </div>
      </div>

      {/* 2. LEARNER PARTICULARS */}
      <div className="border border-stone-300 rounded-lg bg-stone-50/70 p-2.5 text-xs">
        <div className="grid grid-cols-4 gap-2.5">
          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Learner Full Name
            </span>
            <span className="text-xs font-black text-stone-950 block truncate">
              {learner.fullName}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Admission Number
            </span>
            <span className="text-xs font-mono font-black text-stone-900 block">
              {learner.admNo}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Class / Grade
            </span>
            <span className="text-xs font-black text-stone-950 block">
              {learner.grade}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Gender
            </span>
            <span className="text-xs font-bold text-stone-800 block">
              {learner.gender === 'M' ? 'Male' : 'Female'}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Assessment Term
            </span>
            <span className="text-xs font-bold text-emerald-800 block">
              {term} Evaluation
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Class Teacher
            </span>
            <span className="text-xs font-bold text-[#6b1426] block truncate">
              {classTeacherName}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Parent / Guardian Contact
            </span>
            <span className="text-xs font-medium text-stone-800 block truncate">
              {learner.guardianName || 'Parent'} ({learner.guardianPhone || '+254 722 000 000'})
            </span>
          </div>
        </div>
      </div>

      {/* 3. LEARNING AREAS ASSESSMENT TABLE */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
            Learning Areas Competency Assessment
          </h2>
          <span className="text-[9.5px] text-stone-600 font-semibold">
            CBC 8-Point Rubric Scale • Maximum 72 Total Points
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse border border-stone-400">
          <thead>
            <tr className="bg-stone-100 text-stone-950 font-black border-b border-stone-400 text-[11px]">
              <th className="py-2 px-3 border-r border-stone-300 text-center w-8">#</th>
              <th className="py-2 px-3 border-r border-stone-300">LEARNING AREA / SUBJECT</th>
              <th className="py-2 px-3 border-r border-stone-300 w-44">FACULTY TEACHER</th>
              <th className="py-2 px-3 border-r border-stone-300 text-center w-36">RUBRIC LEVEL</th>
              <th className="py-2 px-3 text-center w-24">POINTS (/8)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-300">
            {subjectRows.map((row) => (
              <tr key={row.subject} className={row.index % 2 === 0 ? 'bg-stone-50/40' : 'bg-white'}>
                <td className="py-2 px-3 border-r border-stone-300 text-center font-bold text-stone-500">
                  {row.index}
                </td>
                <td className="py-2 px-3 border-r border-stone-300 font-bold text-stone-900">
                  {row.subject}
                </td>
                <td className="py-2 px-3 border-r border-stone-300 text-stone-700 font-medium text-[11px]">
                  {row.faculty}
                </td>
                <td className="py-2 px-3 border-r border-stone-300 text-center font-bold">
                  <span className="px-2 py-0.5 rounded text-[10.5px] bg-stone-100 border border-stone-300 font-mono text-stone-900">
                    {row.level}
                  </span>
                </td>
                <td className="py-2 px-3 text-center font-mono font-black text-xs text-stone-950">
                  {row.points !== null ? `${row.points} / 8` : '—'}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Assessment Summary Footer */}
          <tfoot>
            <tr className="bg-stone-100 border-t-2 border-stone-400 font-black text-stone-950 text-xs">
              <td colSpan={3} className="py-2 px-3 text-right uppercase tracking-wider border-r border-stone-300">
                TOTAL CBC ASSESSMENT POINTS (OUT OF 72):
              </td>
              <td className="py-2 px-3 text-center border-r border-stone-300 font-bold text-stone-900 bg-stone-50">
                {overall.level} — {overall.name}
              </td>
              <td className="py-2 px-3 text-center font-mono text-sm text-[#6b1426] bg-rose-50 font-black">
                {totalPoints} / 72
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. CONCISE RUBRIC SCALE KEY */}
      <div className="bg-stone-50 border border-stone-300 p-2 rounded-lg text-[9.5px] text-stone-700 grid grid-cols-4 gap-2 text-center">
        <div className="bg-white p-1 rounded border border-stone-200">
          <strong className="text-stone-950 font-bold block text-[10px]">EE (7–8 pts)</strong>
          <span>Exceeding Expectations</span>
        </div>
        <div className="bg-white p-1 rounded border border-stone-200">
          <strong className="text-stone-900 font-bold block text-[10px]">ME (5–6 pts)</strong>
          <span>Meeting Expectations</span>
        </div>
        <div className="bg-white p-1 rounded border border-stone-200">
          <strong className="text-stone-800 font-bold block text-[10px]">AE (3–4 pts)</strong>
          <span>Approaching Expectations</span>
        </div>
        <div className="bg-white p-1 rounded border border-stone-200">
          <strong className="text-stone-700 font-bold block text-[10px]">BE (1–2 pts)</strong>
          <span>Below Expectations</span>
        </div>
      </div>

      {/* 5. REMARKS */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="border border-stone-300 p-2.5 rounded-lg bg-white flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
              General Learner Conduct &amp; Progress
            </span>
            <p className="text-[11px] text-stone-800 italic leading-snug">
              {learner.comments?.generalComment ||
                'Demonstrates high discipline, strong values, and cooperative engagement in class.'}
            </p>
          </div>
          <div className="pt-1.5 mt-1 border-t border-stone-100 flex justify-between text-[9px] text-stone-500">
            <span>Assessment Date: 21st September, 2026</span>
            <span>Record Verified ✓</span>
          </div>
        </div>

        <div className="border border-stone-300 p-2.5 rounded-lg bg-white flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
              Class Teacher Remarks
            </span>
            <p className="text-[11px] text-stone-800 italic leading-snug">
              {learner.comments?.classTeacherComment ||
                'Consistent academic effort and commendable mastery of core competencies.'}
            </p>
          </div>
          <div className="pt-1.5 mt-1 border-t border-stone-100 flex justify-between items-center text-[9px] text-stone-700">
            <span>Class Teacher: <strong>{classTeacherName}</strong></span>
            <span>Signature: __________________</span>
          </div>
        </div>
      </div>

      {/* 6. HEAD OF INSTITUTION ENDORSEMENT & OFFICIAL STAMP SPACE (RED WARNING STRICTLY BELOW) */}
      <div className="border border-stone-400 p-3 rounded-xl bg-stone-50/60">
        <div className="flex flex-row items-center justify-between gap-3">
          {/* Head Teacher Endorsement */}
          <div className="space-y-1 text-xs max-w-md w-full">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
              Head of Institution Endorsement
            </span>
            <p className="text-[11px] text-stone-800 italic leading-tight">
              Approved under the Kenya National Examinations Council &amp; Ministry of Education Junior Secondary Assessment Framework.
            </p>
            <div className="pt-1 text-[10px] text-stone-800 space-y-0.5">
              <div>Head Teacher: <strong className="text-stone-950 font-black">Mr John Koech</strong></div>
              <div>Official Signature &amp; Date: _________________________________</div>
            </div>
          </div>

          {/* Dedicated Space for Physical Stamp with RED WARNING Strictly Below */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="w-48 h-20 rounded-lg border-2 border-dashed border-stone-400 bg-white flex flex-col items-center justify-center p-1 text-center">
              <Stamp className="w-4 h-4 text-stone-300 mb-0.5" />
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                Official Rubber Stamp Space
              </span>
            </div>
            
            {/* RED warning ONLY below the stamp space */}
            <p className="mt-1 text-red-600 font-extrabold text-[9px] uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
              <span>Invalid without official rubber stamp</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
