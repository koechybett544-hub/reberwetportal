import React, { useState, useEffect, useMemo } from 'react';
import { Learner } from '../types';
import { SCHOOL_INFO, SUBJECTS } from '../data/initialData';
import { calculateOverallRubric } from '../utils/grading';
import {
  formatPhoneForWhatsApp,
  formatReportCardWhatsApp,
  dispatchPortalWhatsApp,
  SubjectRubricSummary,
} from '../utils/smsService';
import {
  X,
  Phone,
  User,
  CheckCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface WhatsAppDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner | null;
  marks: any[];
  term: string;
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

export const WhatsAppDispatchModal: React.FC<WhatsAppDispatchModalProps> = ({
  isOpen,
  onClose,
  learner,
  marks,
  term,
  onShowSuccessToast,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [reopeningDate, setReopeningDate] = useState('5th January 2027');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Compute learner's 9 subjects and points
  const reportDetails = useMemo(() => {
    if (!learner) return null;

    const learnerMarks = marks.filter(
      (m) => m.learnerId === learner.id && m.term === term
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
  }, [learner, marks, term]);

  // Generate WhatsApp formatted text
  const generateWhatsAppText = () => {
    if (!learner || !reportDetails) return '';

    return formatReportCardWhatsApp({
      learnerName: learner.fullName,
      admNo: learner.admNo,
      grade: learner.grade,
      term,
      year: SCHOOL_INFO.currentYear,
      subjects: reportDetails.subjects,
      totalPoints: reportDetails.totalPoints,
      overallRubric: reportDetails.overallRubric,
      attendanceRate: reportDetails.attendanceRate,
      classTeacherComment: reportDetails.comment,
      reopeningDate,
      schoolName: SCHOOL_INFO.name,
      headTeacher: 'Mr John Koech',
      headTeacherPhone: '+254 710 889 123',
    });
  };

  // Sync state whenever modal opens or learner changes
  useEffect(() => {
    if (isOpen && learner) {
      const phone = learner.guardianPhone || '+254 722 000 000';
      setPhoneNumber(phone);
      setParentName(learner.guardianName || `Parent of ${learner.fullName}`);
      setValidationError(null);
      setCopied(false);
      setIsSubmitting(false);

      const generated = generateWhatsAppText();
      setCustomMessage(generated);
    }
  }, [isOpen, learner?.id, term, reopeningDate]);

  if (!isOpen || !learner) return null;

  const formattedCleanPhone = formatPhoneForWhatsApp(phoneNumber);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowSuccessToast('Report card copied to clipboard.');
    } catch {
      onShowSuccessToast('Could not copy to clipboard.');
    }
  };

  const handleResetToDefault = () => {
    const text = generateWhatsAppText();
    setCustomMessage(text);
    onShowSuccessToast('Reset to default system report card format.');
  };

  const handleConnectAndSend = () => {
    if (!phoneNumber.trim()) {
      setValidationError('Please enter or select a valid phone number for the parent.');
      return;
    }

    const clean = formatPhoneForWhatsApp(phoneNumber);
    if (!clean || clean.length < 9) {
      setValidationError(
        `The number "${phoneNumber}" is not a valid WhatsApp number. Please provide a standard phone number (e.g. 0712345678 or +254 712 345 678).`
      );
      return;
    }

    if (!customMessage.trim()) {
      setValidationError('Message cannot be empty.');
      return;
    }

    let messageToSend = customMessage.trim();
    if (learner) {
      const hasAdm = messageToSend.toLowerCase().includes(learner.admNo.toLowerCase());
      const hasName = messageToSend.toLowerCase().includes(learner.fullName.toLowerCase());
      if (!hasAdm || !hasName) {
        messageToSend = `*Learner:* ${learner.fullName} | *ADM:* ${learner.admNo} (${learner.grade})\n\n${messageToSend}`;
      }
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      // Dispatch real-time record and open WhatsApp
      const result = dispatchPortalWhatsApp(
        parentName || (learner ? `Parent of ${learner.fullName}` : 'Parent'),
        clean,
        messageToSend,
        'report_card',
        learner ? { admNo: learner.admNo, name: learner.fullName } : undefined
      );

      if (result.success) {
        onShowSuccessToast(
          `Connected to WhatsApp for ${parentName} (+${clean})! Opening WhatsApp...`
        );
        onClose();
      } else {
        setValidationError('Could not initialize WhatsApp connection. Please check the number.');
      }
    } catch (err) {
      console.error('WhatsApp dispatch failed:', err);
      setValidationError('An error occurred connecting to WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
        {/* WhatsApp Brand Header */}
        <div className="bg-[#075E54] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-sm shrink-0">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Connect to WhatsApp &amp; Send Report
                </h3>
                <span className="text-[10px] bg-white/20 text-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Instantly connect to WhatsApp chat with parent and dispatch official CBC report card.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[78vh]">
          {/* Learner Card Summary */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#6b1426] text-white font-black flex items-center justify-center text-sm shadow-2xs">
                {learner.fullName.charAt(0)}
              </div>
              <div>
                <strong className="text-stone-900 block font-black text-sm">
                  {learner.fullName}
                </strong>
                <span className="text-stone-500 text-[11px]">
                  ADM: <strong className="font-mono text-stone-700">{learner.admNo}</strong> • Class: <strong className="text-stone-700">{learner.grade}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="bg-rose-50 text-[#6b1426] border border-rose-200 px-2.5 py-1 rounded-lg">
                Score: {reportDetails?.totalPoints}/72 pts
              </span>
              <span className="bg-sky-50 text-sky-900 border border-sky-200 px-2.5 py-1 rounded-lg">
                {reportDetails?.overallRubric}
              </span>
            </div>
          </div>

          {/* Number Selector / Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Choose or Enter Parent WhatsApp Phone Number <span className="text-rose-600">*</span>
            </label>

            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. +254 722 123 456 or 0722123456"
                className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-stone-300 font-mono text-xs sm:text-sm font-bold focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366]"
              />
              <div className="absolute right-2 top-2">
                <span className="text-[11px] font-mono font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded-md border border-stone-200">
                  {formattedCleanPhone ? `+${formattedCleanPhone}` : 'No number'}
                </span>
              </div>
            </div>

            {/* Quick Chips for Phone Numbers */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="text-stone-500 font-medium">Quick Pick:</span>
              {learner.guardianPhone && (
                <button
                  type="button"
                  onClick={() => setPhoneNumber(learner.guardianPhone || '')}
                  className={`px-2 py-0.5 rounded-lg border font-mono font-bold transition ${
                    phoneNumber === learner.guardianPhone
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  Guardian: {learner.guardianPhone}
                </button>
              )}
              <button
                type="button"
                onClick={() => setPhoneNumber('+254 712 000 000')}
                className="px-2 py-0.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 font-mono"
              >
                Alternative Number
              </button>
            </div>
          </div>

          {/* Parent Name input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Parent / Guardian Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent or Guardian Name"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-[#25D366] focus:outline-none"
              />
            </div>
          </div>

          {/* Message Preview & Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                WhatsApp Report Card Preview (Editable)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-[11px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-stone-100 transition"
                  title="Reset to system calculated values"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Draft</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-emerald-50 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={10}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 rounded-2xl border border-stone-300 font-mono text-xs leading-relaxed focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366] bg-[#fcfdfd] text-stone-900"
              />
            </div>
            <p className="text-[10px] text-stone-500 flex items-center gap-1">
              <span>Tip: Bolding with</span> <code className="bg-stone-100 px-1 py-0.5 rounded text-[#075E54] font-bold">*text*</code> <span>will show up styled in WhatsApp.</span>
            </p>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 text-center sm:text-left">
            <span>Recipient: </span>
            <strong className="font-mono text-stone-900">
              {formattedCleanPhone ? `+${formattedCleanPhone}` : 'Select valid number'}
            </strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition"
            >
              Cancel
            </button>

            {/* Prominent WhatsApp Connect & Send Button */}
            <button
              type="button"
              id="connect-whatsapp-and-send-btn"
              onClick={handleConnectAndSend}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Connect to WhatsApp &amp; Send</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
