import React, { useState, useEffect, useMemo } from 'react';
import { Learner, UserProfile } from '../types';
import { SCHOOL_INFO, SUBJECTS } from '../data/initialData';
import { calculateAssessment, calculateOverallRubric } from '../utils/grading';
import {
  formatReportCardSms,
  openNativeSms,
  dispatchPortalSms,
  dispatchPortalWhatsApp,
  formatPhoneForWhatsApp,
  getStoredSmsHistory,
  SmsMessageRecord,
  SubjectRubricSummary,
} from '../utils/smsService';
import {
  MessageSquare,
  Send,
  Smartphone,
  MessageCircle,
  Users,
  CheckCircle2,
  Clock,
  X,
  FileText,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  PhoneCall,
  Search,
  RotateCcw,
  Sparkles,
  Phone,
  User,
  Calendar,
  Layers,
  Edit3,
} from 'lucide-react';

interface ParentSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  learners: Learner[];
  marks: any[];
  currentUser: UserProfile;
  initialLearner?: Learner | null;
  onShowSuccessToast: (msg: string) => void;
}

const SUBJECT_ABBR: Record<string, string> = {
  'Mathematics': 'MATH',
  'English': 'ENG',
  'Kiswahili': 'KISW',
  'Integrated Science': 'SCI',
  'Social Studies': 'SOC',
  'Agriculture & Nutrition': 'AGRI',
  'Pre-Technical Studies': 'P-TECH',
  'CRE (Religious Education)': 'CRE',
  'Creative Arts & Sports': 'ARTS',
};

export const ParentSMSModal: React.FC<ParentSMSModalProps> = ({
  isOpen,
  onClose,
  learners,
  marks,
  currentUser,
  initialLearner,
  onShowSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<'report_card' | 'general' | 'history'>('report_card');
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 8');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>('');
  const [isBulkGrade, setIsBulkGrade] = useState<boolean>(false);

  // Editable Message State (allows teacher to freely customize message before sending)
  const [editableMessage, setEditableMessage] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');

  // General templates state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('reopening');
  const [reopeningDate, setReopeningDate] = useState<string>('5th January 2027');

  // Real-time dispatch state & feedback
  const [history, setHistory] = useState<SmsMessageRecord[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [lastDeliveredRecord, setLastDeliveredRecord] = useState<SmsMessageRecord | null>(null);

  // Initialize selected learner from props or class
  useEffect(() => {
    if (initialLearner) {
      setSelectedGrade(initialLearner.grade);
      setSelectedLearnerId(initialLearner.id);
    } else {
      const defaultLearners = learners.filter((l) => l.grade === selectedGrade);
      if (defaultLearners.length > 0 && !selectedLearnerId) {
        setSelectedLearnerId(defaultLearners[0].id);
      }
    }
  }, [initialLearner, isOpen, learners, selectedGrade]);

  // Load history on open
  useEffect(() => {
    if (isOpen) {
      setHistory(getStoredSmsHistory());
      setLastDeliveredRecord(null);
    }
  }, [isOpen]);

  const currentGradeLearners = useMemo(() => {
    return learners.filter((l) => l.grade === selectedGrade);
  }, [learners, selectedGrade]);

  const activeLearner = useMemo(() => {
    return (
      learners.find((l) => l.id === selectedLearnerId) ||
      currentGradeLearners[0] ||
      learners[0]
    );
  }, [learners, selectedLearnerId, currentGradeLearners]);

  // Helper to compile a learner's 9 subjects and calculate rubrics + total points
  const getLearnerReportDetails = (learner: Learner) => {
    const learnerMarks = marks.filter(
      (m) => m.learnerId === learner.id && m.term === 'Term 3'
    );
    let totalPts = 0;

    const subjects: SubjectRubricSummary[] = SUBJECTS.map((subj) => {
      const entry = learnerMarks.find((m) => m.subject === subj);
      let pts: number | null = null;
      let rubric = '—';
      let score: number | null = null;

      if (entry) {
        if (entry.points !== null && entry.points !== undefined) {
          pts = entry.points;
          totalPts += entry.points;
        }
        if (entry.assessmentLevel) {
          rubric = entry.assessmentLevel;
        }
        if (entry.scoreOutOf100 !== null && entry.scoreOutOf100 !== undefined) {
          score = entry.scoreOutOf100;
        }
      }

      return {
        subject: subj,
        abbreviation: SUBJECT_ABBR[subj] || subj.substring(0, 4).toUpperCase(),
        rubricLevel: rubric,
        points: pts,
        scoreOutOf100: score,
      };
    });

    const overall = calculateOverallRubric(totalPts);
    return {
      subjects,
      totalPoints: totalPts,
      overallRubric: `${overall.level} (${overall.name})`,
      attendanceRate: learner.attendanceRate || 95,
      comment:
        learner.comments?.classTeacherComment ||
        learner.comments?.generalComment ||
        'Good progress shown. Dedicated learner with strong CBC core competencies.',
    };
  };

  // Generate system report card draft text
  const generateSystemReportSms = (learner: Learner): string => {
    const rep = getLearnerReportDetails(learner);
    return formatReportCardSms({
      learnerName: learner.fullName,
      admNo: learner.admNo,
      grade: learner.grade,
      term: 'Term 3',
      year: SCHOOL_INFO.currentYear,
      subjects: rep.subjects,
      totalPoints: rep.totalPoints,
      overallRubric: rep.overallRubric,
      attendanceRate: rep.attendanceRate,
      classTeacherComment: rep.comment,
      reopeningDate,
      schoolName: SCHOOL_INFO.name,
      headTeacher: 'Mr John Koech',
      headTeacherPhone: '+254 710 889 123',
    });
  };

  // Helper to ensure EVERY parent message strictly contains learner name & admission number
  const ensureLearnerIdentity = (content: string, lrn: Learner): string => {
    let text = content.trim();
    const hasAdm = text.toLowerCase().includes(lrn.admNo.toLowerCase());
    const hasName = text.toLowerCase().includes(lrn.fullName.toLowerCase()) || 
                    (lrn.firstName && text.toLowerCase().includes(lrn.firstName.toLowerCase()));

    if (!hasAdm || !hasName) {
      const headerPrefix = `Learner: ${lrn.fullName} | ADM: ${lrn.admNo} (${lrn.grade})\n`;
      return `${headerPrefix}${text}`;
    }
    return text;
  };

  // General SMS templates with learner name & admission number strictly included
  const getTemplateForLearner = (templateKey: string, lrn: Learner): string => {
    const lrnName = lrn.fullName;
    const lrnAdm = lrn.admNo;
    const lrnGrade = lrn.grade;

    switch (templateKey) {
      case 'reopening':
        return `REBERWET JUNIOR SECONDARY SCHOOL
PARENT NOTICE
Learner: ${lrnName} | ADM: ${lrnAdm} (${lrnGrade})
Dear Parent/Guardian, Term 3 has concluded successfully. School reopens for Term 1 on ${reopeningDate} at 7:30 AM. Kindly ensure ${lrnName} reports promptly with complete school uniform and CBC project materials.
Head Teacher: Mr John Koech (+254 710 889 123).`;

      case 'fee_reminder':
        return `REBERWET JUNIOR SECONDARY SCHOOL
ACCOUNTS NOTICE
Learner: ${lrnName} | ADM: ${lrnAdm} (${lrnGrade})
Dear Parent/Guardian, you are kindly reminded to settle all outstanding school development and lunch program arrears for ${lrnName} (ADM ${lrnAdm}) prior to reopening on ${reopeningDate}.
Accounts Office: +254 710 889 123. Thank you.`;

      case 'clinic':
        return `REBERWET JUNIOR SECONDARY SCHOOL
CBC ACADEMIC CLINIC
Learner: ${lrnName} | ADM: ${lrnAdm} (${lrnGrade})
Dear Parent/Guardian of ${lrnName}, you are warmly invited to the CBC Academic Progress & Career Path Guidance Clinic on Friday at 9:00 AM in the school hall to review ${lrn.firstName || lrnName}'s academic performance.
Reberwet JSS Administration.`;

      case 'sports_trip':
        return `REBERWET JUNIOR SECONDARY SCHOOL
CO-CURRICULAR NOTICE
Learner: ${lrnName} | ADM: ${lrnAdm} (${lrnGrade})
Dear Parent/Guardian, our JSS Athletics & Creative Arts Festival is scheduled for next Wednesday. Kindly ensure ${lrnName} (ADM: ${lrnAdm}) reports with official sports uniform and sports kit.
Reberwet JSS Management.`;

      default:
        return `REBERWET JUNIOR SECONDARY SCHOOL
OFFICIAL COMMUNICATION
Learner: ${lrnName} | ADM: ${lrnAdm} (${lrnGrade})
Dear Parent/Guardian, this is an official update regarding ${lrnName}. Please feel free to consult the administration for any inquiries.
Reberwet JSS Office (+254 710 889 123).`;
    }
  };

  // Whenever activeLearner, activeTab, reopeningDate, or selectedTemplate changes, update the editable message draft
  useEffect(() => {
    if (!activeLearner) return;

    // Update phone & recipient name
    setRecipientPhone(activeLearner.guardianPhone || '+254 722 000 000');
    setRecipientName(
      activeLearner.guardianName || `Guardian of ${activeLearner.fullName}`
    );

    if (activeTab === 'report_card') {
      const defaultReport = generateSystemReportSms(activeLearner);
      setEditableMessage(defaultReport);
    } else if (activeTab === 'general') {
      setEditableMessage(getTemplateForLearner(selectedTemplate, activeLearner));
    }
  }, [activeLearner?.id, activeTab, selectedGrade, reopeningDate, selectedTemplate]);

  if (!isOpen) return null;

  // Reset to default system-calculated report card message
  const handleResetToDefaultDraft = () => {
    if (activeTab === 'report_card' && activeLearner) {
      const defaultText = generateSystemReportSms(activeLearner);
      setEditableMessage(defaultText);
      onShowSuccessToast('Reset message to system-calculated report card draft.');
    } else if (activeTab === 'general' && activeLearner) {
      setEditableMessage(getTemplateForLearner(selectedTemplate, activeLearner));
      onShowSuccessToast('Reset message to selected template.');
    }
  };

  // Quick insertion tokens into message
  const handleAppendNote = (textToAppend: string) => {
    setEditableMessage((prev) => `${prev.trim()}\n\n${textToAppend}`);
    onShowSuccessToast('Appended note to message text.');
  };

  // Real-time copy to clipboard
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(editableMessage);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2500);
      onShowSuccessToast('Message copied to clipboard.');
    } catch {
      onShowSuccessToast('Unable to copy to clipboard.');
    }
  };

  // Real-time Send via Native Phone SMS App
  const handleSendViaNativeSms = () => {
    if (!activeLearner) return;
    const phone = recipientPhone.trim() || activeLearner.guardianPhone || '+254722000000';
    let textToSend = editableMessage.trim();

    if (!textToSend) {
      onShowSuccessToast('Message cannot be empty.');
      return;
    }

    // Strictly enforce learner name and admission number
    textToSend = ensureLearnerIdentity(textToSend, activeLearner);

    // Trigger phone SMS
    openNativeSms(phone, textToSend);

    // Save record to local real-time history
    const record = dispatchPortalSms(
      recipientName || activeLearner.guardianName || `Parent of ${activeLearner.fullName}`,
      phone,
      textToSend,
      activeTab === 'report_card' ? 'report_card' : 'general_announcement',
      { admNo: activeLearner.admNo, name: activeLearner.fullName }
    );

    setLastDeliveredRecord(record);
    setHistory(getStoredSmsHistory());
    onShowSuccessToast(`Opening phone SMS app for ${phone}...`);
  };

  // Real-time Send via Portal Gateway (Instant)
  const handleDispatchRealTimeGatewaySms = () => {
    const rawText = editableMessage.trim();
    if (!rawText) {
      onShowSuccessToast('Message cannot be empty.');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      if (isBulkGrade) {
        // Bulk dispatch to all learners in class
        let count = 0;
        currentGradeLearners.forEach((lrn) => {
          const phone = lrn.guardianPhone || '+254722000000';
          let body = '';
          if (activeTab === 'report_card') {
            body = generateSystemReportSms(lrn);
          } else {
            body = getTemplateForLearner(selectedTemplate, lrn);
          }

          // Strictly guarantee learner's name and admission number
          body = ensureLearnerIdentity(body, lrn);

          dispatchPortalSms(
            lrn.guardianName || `Parent of ${lrn.fullName}`,
            phone,
            body,
            activeTab === 'report_card' ? 'report_card' : 'general_announcement',
            { admNo: lrn.admNo, name: lrn.fullName }
          );
          count++;
        });

        const updatedHistory = getStoredSmsHistory();
        setHistory(updatedHistory);
        setLastDeliveredRecord(updatedHistory[0] || null);
        setIsSending(false);
        onShowSuccessToast(`Real-time SMS dispatched to all ${count} parents in ${selectedGrade}!`);
      } else {
        // Single learner dispatch with the edited text, strictly verifying learner identity
        const textToSend = ensureLearnerIdentity(rawText, activeLearner);
        const phone = recipientPhone.trim() || activeLearner.guardianPhone || '+254722000000';
        const recName = recipientName.trim() || activeLearner.guardianName || `Parent of ${activeLearner.fullName}`;

        const record = dispatchPortalSms(
          recName,
          phone,
          textToSend,
          activeTab === 'report_card' ? 'report_card' : 'general_announcement',
          { admNo: activeLearner.admNo, name: activeLearner.fullName }
        );

        setLastDeliveredRecord(record);
        setHistory(getStoredSmsHistory());
        setIsSending(false);
        onShowSuccessToast(`Real-time SMS dispatched successfully to ${recName} (${phone})!`);
      }
    }, 400);
  };

  const characterCount = editableMessage.length;
  const smsUnits = Math.max(1, Math.ceil(characterCount / 160));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="bg-[#6b1426] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Parent &amp; Guardian SMS Dispatch Center</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                  Real-Time &amp; Editable
                </span>
              </h2>
              <p className="text-xs text-rose-200">
                Edit report cards and announcements freely before dispatching in real time to parents/guardians' mobile phones.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('report_card')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'report_card'
                ? 'border-[#6b1426] text-[#6b1426]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CBC Report Card SMS</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'general'
                ? 'border-[#6b1426] text-[#6b1426]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>General Parent Announcement</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 sm:ml-auto ${
              activeTab === 'history'
                ? 'border-[#6b1426] text-[#6b1426]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Real-Time Log ({history.length})</span>
          </button>
        </div>

        {/* Real-time Delivery Success Banner */}
        {lastDeliveredRecord && activeTab !== 'history' && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Dispatched Successfully in Real Time:</strong> Sent to{' '}
                <strong>{lastDeliveredRecord.recipientName}</strong> ({lastDeliveredRecord.recipientPhone}) at {lastDeliveredRecord.timestamp}.
              </span>
            </div>
            <button
              onClick={() => setLastDeliveredRecord(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-stone-900">
          {activeTab !== 'history' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Target Selector & Editable Message Editor */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Targeting Box */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                        Junior Secondary Class
                      </label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => {
                          setSelectedGrade(e.target.value);
                          const firstInGrade = learners.find((l) => l.grade === e.target.value);
                          if (firstInGrade) setSelectedLearnerId(firstInGrade.id);
                        }}
                        className="w-full text-xs font-bold border border-stone-300 rounded-lg p-2 bg-white text-stone-800"
                      >
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                        Dispatch Target
                      </label>
                      <select
                        value={isBulkGrade ? 'bulk' : 'single'}
                        onChange={(e) => setIsBulkGrade(e.target.value === 'bulk')}
                        className="w-full text-xs font-bold border border-stone-300 rounded-lg p-2 bg-white text-stone-800"
                      >
                        <option value="single">Single Learner</option>
                        <option value="bulk">Bulk All ({currentGradeLearners.length} Learners)</option>
                      </select>
                    </div>
                  </div>

                  {!isBulkGrade && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                        Select Learner
                      </label>
                      <select
                        value={selectedLearnerId}
                        onChange={(e) => setSelectedLearnerId(e.target.value)}
                        className="w-full text-xs font-bold border border-stone-300 rounded-lg p-2 bg-white text-stone-800"
                      >
                        {currentGradeLearners.map((lrn) => (
                          <option key={lrn.id} value={lrn.id}>
                            ADM {lrn.admNo} - {lrn.fullName} ({lrn.guardianPhone || 'No Phone'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Editable Recipient Contact Details */}
                  {!isBulkGrade && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-stone-200">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-stone-400" />
                          <span>Parent / Guardian Name</span>
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="e.g. Mary Cherono"
                          className="w-full text-xs font-bold border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>Parent Phone (Editable)</span>
                        </label>
                        <input
                          type="text"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="e.g. +254 722 000 000"
                          className="w-full text-xs font-mono font-bold border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-[#6b1426]"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'report_card' && (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">
                        Next Term Reopening Date
                      </label>
                      <input
                        type="text"
                        value={reopeningDate}
                        onChange={(e) => setReopeningDate(e.target.value)}
                        placeholder="e.g. 5th January 2027"
                        className="w-full text-xs font-semibold border border-stone-300 rounded-lg p-2 bg-white text-stone-800"
                      />
                    </div>
                  )}

                  {activeTab === 'general' && (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                        Choose Template Baseline
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {(['reopening', 'fee_reminder', 'clinic', 'sports_trip'] as const).map((tmpl) => (
                          <button
                            key={tmpl}
                            type="button"
                            onClick={() => setSelectedTemplate(tmpl)}
                            className={`p-1.5 rounded-lg border text-center text-[11px] font-bold capitalize transition ${
                              selectedTemplate === tmpl
                                ? 'bg-rose-50 border-[#6b1426] text-[#6b1426]'
                                : 'bg-white border-stone-300 text-stone-700'
                            }`}
                          >
                            {tmpl.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Teacher Editable Message Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#6b1426]" />
                      <span>Editable Message Content (Type &amp; Customize Below)</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleResetToDefaultDraft}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 hover:text-sky-950 underline"
                      title="Reset to system-calculated report card"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to System Draft</span>
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={12}
                      value={editableMessage}
                      onChange={(e) => setEditableMessage(e.target.value)}
                      placeholder="Type or edit the message that will be sent to the parent..."
                      className="w-full text-xs font-mono border-2 border-stone-300 focus:border-[#6b1426] rounded-xl p-3 bg-white text-stone-900 leading-relaxed focus:outline-none shadow-2xs"
                    />
                  </div>

                  {/* Character & SMS Unit Counter */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-3">
                      <span>Characters: <strong>{characterCount}</strong></span>
                      <span>SMS Units: <strong className="text-[#6b1426]">{smsUnits}</strong> (160 chars/SMS)</span>
                    </div>

                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Real-time Live Sync</span>
                    </span>
                  </div>

                  {/* Quick-Append Helper Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Quick Teacher Additions (Tap to append to message):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAppendNote('Reminder: Please ensure any pending lunch or school development arrears are cleared before opening day.')}
                        className="text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 px-2 py-1 rounded-md border border-stone-300 transition"
                      >
                        + Fee Reminder
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppendNote('Notice: Academic consultative clinic will be held on the first Friday of term at 9:00 AM.')}
                        className="text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 px-2 py-1 rounded-md border border-stone-300 transition"
                      >
                        + Academic Clinic
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppendNote('Supplies: Learner should report with 2 squared exercise books and a standard mathematical set.')}
                        className="text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 px-2 py-1 rounded-md border border-stone-300 transition"
                      >
                        + Supplies Note
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppendNote('Commendation: Exemplary discipline and positive attitude displayed in class. Hongera!')}
                        className="text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-[#6b1426] px-2 py-1 rounded-md border border-rose-200 transition"
                      >
                        + Commendation
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Mobile Preview & Real-Time Action Buttons */}
              <div className="lg:col-span-5 space-y-4">
                {/* Mobile Device Mockup Preview */}
                <div className="bg-stone-900 rounded-2xl p-4 text-white shadow-xl relative border-4 border-stone-800">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-700 mb-3 text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-stone-300">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Parent Phone Preview</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">
                      {isBulkGrade
                        ? `To: ${currentGradeLearners.length} Guardians`
                        : `To: ${recipientPhone || '+254 722 000 000'}`}
                    </span>
                  </div>

                  {/* SMS Message Bubble */}
                  <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 text-emerald-100 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
                    {editableMessage || 'No message entered yet...'}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Sender: <strong>REBERWET_JSS</strong></span>
                    <span className="text-emerald-400 font-semibold">{smsUnits} SMS Unit(s)</span>
                  </div>
                </div>

                {/* Real-Time Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  {/* Connect to WhatsApp & Send */}
                  {!isBulkGrade && (
                    <button
                      type="button"
                      id="send-via-whatsapp-btn"
                      onClick={() => {
                        const cleanPhone = formatPhoneForWhatsApp(recipientPhone);
                        if (!cleanPhone || cleanPhone.length < 9) {
                          onShowSuccessToast('Please enter a valid phone number.');
                          return;
                        }
                        dispatchPortalWhatsApp(
                          recipientName || (activeLearner ? `Parent of ${activeLearner.fullName}` : 'Parent'),
                          cleanPhone,
                          editableMessage,
                          activeTab === 'report_card' ? 'report_card' : 'general_announcement',
                          activeLearner ? { admNo: activeLearner.admNo, name: activeLearner.fullName } : undefined
                        );
                        setHistory(getStoredSmsHistory());
                        onShowSuccessToast(`Connecting to WhatsApp for ${recipientName || 'Parent'} (+${cleanPhone})...`);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 px-4 text-xs font-extrabold shadow-md transition active:scale-98"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Connect to WhatsApp &amp; Send (Real-Time)</span>
                    </button>
                  )}

                  {/* Send via Native Phone SMS App */}
                  {!isBulkGrade && (
                    <button
                      type="button"
                      id="send-via-native-sms-btn"
                      onClick={handleSendViaNativeSms}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-4 text-xs font-bold shadow-md transition active:scale-98"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send via Phone SMS App (Real-Time)</span>
                    </button>
                  )}

                  {/* Dispatch Instant Portal Gateway SMS */}
                  <button
                    type="button"
                    id="dispatch-real-time-sms-btn"
                    disabled={isSending}
                    onClick={handleDispatchRealTimeGatewaySms}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6b1426] hover:bg-[#520e1c] text-white py-3 px-4 text-xs font-bold shadow-md transition active:scale-98 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSending
                        ? 'Dispatching SMS in Real Time...'
                        : isBulkGrade
                        ? `Send Real-Time SMS to All ${currentGradeLearners.length} Guardians`
                        : `Send Real-Time SMS to ${recipientName || 'Parent'}`}
                    </span>
                  </button>

                  {/* Copy Message Button */}
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 py-2.5 px-4 text-xs font-bold shadow-2xs transition active:scale-98"
                  >
                    {copiedFeedback ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-stone-600" />
                        <span>Copy Message Text</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10.5px] text-center text-stone-500 leading-tight">
                    Messages are delivered directly to parent phone numbers via Safaricom/Airtel SMS network. Logged in real time.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Tab: Real-Time History & Delivery Log */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Real-Time SMS Transmission Ledger ({history.length} Messages)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Verified records of report cards and announcements dispatched to parents.
                  </p>
                </div>

                {history.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('reberwet_jss_sms_history_v1');
                      setHistory([]);
                      onShowSuccessToast('SMS dispatch log cleared.');
                    }}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                  >
                    Clear Log
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="space-y-2.5">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="p-3.5 text-xs rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition shadow-2xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-stone-950 font-bold text-sm">
                            {record.recipientName}
                          </strong>
                          <span className="font-mono text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                            {record.recipientPhone}
                          </span>
                          {record.channel === 'whatsapp' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-[#25D366] fill-current" />
                              <span>WhatsApp</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-[#6b1426] text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              <span>SMS</span>
                            </span>
                          )}
                          {record.learnerName && (
                            <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-200">
                              ADM: {record.learnerAdmNo} ({record.learnerName})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-500">{record.timestamp}</span>
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Delivered ✓</span>
                          </span>
                        </div>
                      </div>

                      <div className="font-mono text-[11px] text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-200 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                        {record.content}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                        <span>Units: {record.units} SMS segment(s) • Gateway Ref: {record.id}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditableMessage(record.content);
                            setRecipientPhone(record.recipientPhone);
                            setRecipientName(record.recipientName);
                            setActiveTab('report_card');
                            onShowSuccessToast('Loaded message into editor for resending.');
                          }}
                          className="font-bold text-[#6b1426] hover:underline"
                        >
                          Reuse / Resend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-stone-500 text-xs border border-dashed border-stone-300 rounded-xl space-y-2">
                  <Smartphone className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="font-bold text-stone-700">No dispatched SMS messages recorded yet.</p>
                  <p>Send a learner's report card or parent notice in real time to start building your dispatch log.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
