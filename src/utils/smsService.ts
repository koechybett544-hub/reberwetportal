import { Learner } from '../types';
import { SCHOOL_INFO } from '../data/initialData';

export interface SmsMessageRecord {
  id: string;
  recipientName: string;
  recipientPhone: string;
  channel?: 'sms' | 'whatsapp';
  learnerAdmNo?: string;
  learnerName?: string;
  messageType: 'report_card' | 'general_announcement' | 'fee_reminder' | 'attendance_alert' | 'academic_clinic';
  content: string;
  status: 'sent' | 'delivered' | 'pending';
  timestamp: string;
  units: number;
}

export interface SubjectRubricSummary {
  subject: string;
  abbreviation: string;
  rubricLevel: string;
  points: number | null;
  scoreOutOf100?: number | null;
}

const SMS_HISTORY_KEY = 'reberwet_jss_sms_history_v1';

export function getStoredSmsHistory(): SmsMessageRecord[] {
  try {
    const raw = localStorage.getItem(SMS_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSmsRecord(record: SmsMessageRecord) {
  try {
    const current = getStoredSmsHistory();
    const updated = [record, ...current].slice(0, 100);
    localStorage.setItem(SMS_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save SMS record:', err);
  }
}

/**
 * Generates an official Kenyan CBC Report Card SMS text message
 * including individual subject rubric levels, total points (/72),
 * attendance, teacher remarks, and reopening date.
 */
export function formatReportCardSms(options: {
  learnerName: string;
  admNo: string;
  grade: string;
  term: string;
  year?: string;
  subjects?: SubjectRubricSummary[];
  totalPoints: number;
  overallRubric: string;
  attendanceRate: number;
  classTeacherComment?: string;
  reopeningDate?: string;
  schoolName?: string;
  headTeacher?: string;
  headTeacherPhone?: string;
}): string {
  const school = options.schoolName || SCHOOL_INFO.name || 'REBERWET JUNIOR SECONDARY SCHOOL';
  const year = options.year || SCHOOL_INFO.currentYear || '2026';
  const reopening = options.reopeningDate || '5th Jan 2027';
  const headTeacher = options.headTeacher || 'Mr John Koech';
  const phone = options.headTeacherPhone || '+254 710 889 123';
  const comment =
    options.classTeacherComment ||
    'Good progress shown. Dedicated learner with strong CBC core competencies.';

  let subjectsSection = '';
  if (options.subjects && options.subjects.length > 0) {
    const list = options.subjects.map((s) => {
      const pts = s.points !== null && s.points !== undefined ? `${s.points}pts` : '—';
      return `• ${s.abbreviation}: ${s.rubricLevel} (${pts})`;
    });
    subjectsSection = `\nSUBJECT RUBRIC LEVELS & POINTS:\n${list.join('\n')}\n`;
  }

  return `${school.toUpperCase()}
CBC ACADEMIC REPORT (${options.term.toUpperCase()}, ${year})
Learner: ${options.learnerName} | ADM: ${options.admNo}
Class: ${options.grade} | Session: ${options.term} ${year}
${subjectsSection}
PERFORMANCE SUMMARY:
• Total Points: ${options.totalPoints}/72
• Overall Level: ${options.overallRubric}
• Term Attendance: ${options.attendanceRate}% Regular

TEACHER REMARKS:
"${comment}"

OFFICIAL NOTICE:
Next Term Reopening: ${reopening} (7:30 AM).
Clear all lunch & school development arrears before opening.
Reberwet JSS Office | Head Teacher: ${headTeacher} (${phone})`;
}

/**
 * Triggers the native phone SMS application with recipient and body
 */
export function openNativeSms(phone: string, message: string) {
  // Clean phone number (remove spaces, hyphens)
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedBody = encodeURIComponent(message);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&body=' : '?body=';
  const smsUrl = `sms:${cleanPhone}${separator}${encodedBody}`;

  const a = document.createElement('a');
  a.href = smsUrl;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Dispatches real-time SMS through portal gateway simulation and records in history log
 */
export function dispatchPortalSms(
  recipientName: string,
  recipientPhone: string,
  content: string,
  type: SmsMessageRecord['messageType'],
  learnerMeta?: { admNo: string; name: string }
): SmsMessageRecord {
  // 1 SMS unit = 160 characters
  const units = Math.max(1, Math.ceil(content.length / 160));
  const record: SmsMessageRecord = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipientName,
    recipientPhone,
    channel: 'sms',
    learnerAdmNo: learnerMeta?.admNo,
    learnerName: learnerMeta?.name,
    messageType: type,
    content,
    status: 'delivered',
    timestamp: new Date().toLocaleString(),
    units,
  };

  saveSmsRecord(record);
  return record;
}

/**
 * Formats any given phone number into a valid international WhatsApp number (digits only, no + or spaces).
 * Handles Kenyan numbers (07xx, 01xx, +254, 254) seamlessly.
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned) return '';

  // Kenyan local mobile numbers starting with 07 or 01 (10 digits)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '254' + cleaned.substring(1);
  }
  // Kenyan mobile numbers entered without leading 0 or 254 (e.g. 712345678 or 112345678, 9 digits)
  else if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
}

/**
 * Generates an official Kenyan CBC Report Card message formatted with
 * WhatsApp-friendly bolding (*text*), bullet points, and clean structure.
 */
export function formatReportCardWhatsApp(options: {
  learnerName: string;
  admNo: string;
  grade: string;
  term: string;
  year?: string;
  subjects?: SubjectRubricSummary[];
  totalPoints: number;
  overallRubric: string;
  attendanceRate: number;
  classTeacherComment?: string;
  reopeningDate?: string;
  schoolName?: string;
  headTeacher?: string;
  headTeacherPhone?: string;
}): string {
  const school = options.schoolName || SCHOOL_INFO.name || 'REBERWET JUNIOR SECONDARY SCHOOL';
  const year = options.year || SCHOOL_INFO.currentYear || '2026';
  const reopening = options.reopeningDate || '5th Jan 2027';
  const headTeacher = options.headTeacher || 'Mr John Koech';
  const phone = options.headTeacherPhone || '+254 710 889 123';
  const comment =
    options.classTeacherComment ||
    'Good progress shown. Dedicated learner with strong CBC core competencies.';

  let subjectsSection = '';
  if (options.subjects && options.subjects.length > 0) {
    const list = options.subjects.map((s) => {
      const pts = s.points !== null && s.points !== undefined ? `${s.points} pts` : '—';
      return `• *${s.subject}* (${s.abbreviation}): ${s.rubricLevel} [${pts}]`;
    });
    subjectsSection = `\n📋 *SUBJECT RUBRIC LEVELS & SCORES:*\n${list.join('\n')}\n`;
  }

  return `🏫 *${school.toUpperCase()}*
📜 *OFFICIAL CBC ACADEMIC PROGRESS REPORT*
━━━━━━━━━━━━━━━━━━━━
👤 *Learner:* *${options.learnerName}*
🔖 *Adm No:* \`${options.admNo}\`
🎒 *Class:* *${options.grade}*
🗓️ *Session:* ${options.term}, ${year}
${subjectsSection}
📊 *PERFORMANCE SUMMARY:*
🏆 *Total Points:* *${options.totalPoints} / 72*
⭐ *Overall Rubric:* *${options.overallRubric}*
📈 *Term Attendance:* ${options.attendanceRate}% Regular

💬 *CLASS TEACHER REMARKS:*
_"${comment}"_

🔔 *OFFICIAL SCHOOL NOTICE:*
📅 *Next Term Reopening:* *${reopening}* (7:30 AM).
⚠️ Kindly clear all school development & lunch program arrears prior to opening.
📞 *Head of Institution:* ${headTeacher} (${phone})
━━━━━━━━━━━━━━━━━━━━
_Delivered via Reberwet JSS Digital Portal_`;
}

/**
 * Connects directly to WhatsApp web or native app for the selected phone number
 * with the pre-filled report card text.
 */
export function openWhatsAppChat(phone: string, message: string): boolean {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  if (!cleanPhone) return false;

  const encodedText = encodeURIComponent(message);
  // Using api.whatsapp.com works smoothly across desktop browsers, mobile Chrome/Safari, and native WhatsApp app
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Dispatches real-time WhatsApp report card, opens WhatsApp, and records in messaging log
 */
export function dispatchPortalWhatsApp(
  recipientName: string,
  recipientPhone: string,
  content: string,
  type: SmsMessageRecord['messageType'],
  learnerMeta?: { admNo: string; name: string }
): { record: SmsMessageRecord; success: boolean } {
  const cleanPhone = formatPhoneForWhatsApp(recipientPhone);
  const success = openWhatsAppChat(cleanPhone, content);

  const record: SmsMessageRecord = {
    id: `wa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipientName,
    recipientPhone: cleanPhone,
    channel: 'whatsapp',
    learnerAdmNo: learnerMeta?.admNo,
    learnerName: learnerMeta?.name,
    messageType: type,
    content,
    status: 'delivered',
    timestamp: new Date().toLocaleString(),
    units: 1,
  };

  saveSmsRecord(record);
  return { record, success };
}
