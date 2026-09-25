import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getCachedAccessToken } from '../lib/firebase';
import { sendGmailMessage, getGmailProfile, GmailProfile } from '../lib/gmail';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';

interface GmailCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onShowSuccessToast: (msg: string) => void;
  onTriggerGoogleSignIn: () => void;
}

export const GmailCenterModal: React.FC<GmailCenterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowSuccessToast,
  onTriggerGoogleSignIn,
}) => {
  const [recipient, setRecipient] = useState('koechybett544@gmail.com');
  const [subject, setSubject] = useState('Reberwet JSS: Grade 8 Academic Assessment Summary');
  const [body, setBody] = useState(
    `Dear Parent/Guardian,\n\nThis is an official communication regarding Term 3 continuous competency assessments at Reberwet Junior Secondary School.\n\nAll % scores and CBC rubric performance records have been updated in the school portal. Please consult the school office for any clarifications.\n\nSincerely,\nReberwet JSS Administration Desk`
  );

  const [gmailProfile, setGmailProfile] = useState<GmailProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const token = getCachedAccessToken();

  useEffect(() => {
    if (isOpen && token) {
      setLoadingProfile(true);
      getGmailProfile()
        .then((profile) => {
          setGmailProfile(profile);
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Pre-fill templates
  const handleApplyTemplate = (type: 'report' | 'meeting' | 'urgent') => {
    if (type === 'report') {
      setSubject('Reberwet JSS - Learner Progress & Assessment Report');
      setBody(
        `Dear Parent/Guardian,\n\nPlease find the CBC assessment update for your learner. All subject marks and competency rubric evaluations for this term have been entered into the school records.\n\nSchool Motto: Together we can make a difference.\n\nReberwet Junior Secondary School`
      );
    } else if (type === 'meeting') {
      setSubject('Reberwet JSS Staff Meeting Notice - Term 3 Evaluation');
      setBody(
        `Dear Colleagues,\n\nYou are invited to our staff briefing on Thursday at 3:30 PM in the staff room. Agenda: Marks entry review, CBC project verification, and upcoming national assessment preparations.\n\nOffice of the Head Teacher`
      );
    } else {
      setSubject('Notice: Reberwet JSS School Activity & Calendar Update');
      setBody(
        `Dear Staff & Guardians,\n\nNotice of updated term calendar events and assessment deadlines for Grade 7, 8, and 9 learners. Please ensure all student portfolios are updated.\n\nReberwet JSS Administration`
      );
    }
  };

  // Pre-flight confirmation click
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !body.trim()) {
      alert('Please fill out recipient, subject, and message content.');
      return;
    }
    // Mandatory explicit user confirmation modal per Workspace Integration guidelines
    setShowConfirmDialog(true);
  };

  // Execute Send after explicit confirmation
  const handleConfirmSend = async () => {
    setShowConfirmDialog(false);
    setIsSending(true);
    setStatusMessage(null);

    const result = await sendGmailMessage({
      to: recipient.trim(),
      subject: subject.trim(),
      body: body.trim(),
      senderName: currentUser.name,
    });

    setIsSending(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: `Message dispatched successfully via Gmail (Message ID: ${result.id || 'ok'}).`,
      });
      onShowSuccessToast('Email dispatched via official Gmail connection.');
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Failed to dispatch email. Please verify your Google permissions.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-stone-200 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
          <div className="w-11 h-11 bg-rose-50 text-[#6b1426] rounded-2xl flex items-center justify-center border border-rose-200 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              Reberwet School Gmail Communicator
            </h3>
            <p className="text-xs text-stone-500">
              Dispatch official circulars, learner reports, and staff notifications directly via Gmail.
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  token ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold text-stone-800">
                {token ? 'Google Workspace Authenticated' : 'Google Account Not Connected'}
              </span>
            </div>
            {!token && (
              <button
                onClick={onTriggerGoogleSignIn}
                className="text-xs font-bold text-[#6b1426] hover:underline"
              >
                Sign In with Google →
              </button>
            )}
          </div>

          {token && gmailProfile && (
            <div className="text-[11px] text-stone-600 flex items-center gap-3">
              <span>Sending as: <strong>{gmailProfile.emailAddress}</strong></span>
              <span>•</span>
              <span>Total Gmail Messages: {gmailProfile.messagesTotal}</span>
            </div>
          )}
        </div>

        {/* Quick Message Templates */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
            Quick Message Templates
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleApplyTemplate('report')}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-3 py-1.5 rounded-xl border border-stone-200 transition"
            >
              📄 Learner Progress Notice
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('meeting')}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-3 py-1.5 rounded-xl border border-stone-200 transition"
            >
              👥 Staff Briefing Memo
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('urgent')}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-3 py-1.5 rounded-xl border border-stone-200 transition"
            >
              📢 School Circular
            </button>
          </div>
        </div>

        {/* Compose Form */}
        <form onSubmit={handleInitiateSend} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Recipient Email (Parent / Staff / Guardian) *
            </label>
            <input
              type="email"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. guardian@gmail.com"
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:border-[#6b1426] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Subject Line *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:border-[#6b1426] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Message Content *</label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-3 text-xs font-medium focus:border-[#6b1426] focus:outline-none leading-relaxed"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={isSending || !token}
              className="px-5 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#540d1e] disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send Message via Gmail</span>
            </button>
          </div>
        </form>

        {/* Confirmation Dialog (Mandatory per Workspace Integration Skill) */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-stone-200">
              <div className="flex items-center gap-3 text-amber-900">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                </div>
                <h4 className="font-extrabold text-stone-900 text-sm">
                  Confirm Gmail Dispatch
                </h4>
              </div>

              <div className="text-xs text-stone-600 space-y-2">
                <p>
                  You are about to send an official email to{' '}
                  <strong className="text-stone-900">{recipient}</strong> from your connected Gmail address.
                </p>
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-[11px]">
                  <strong>Subject:</strong> {subject}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#6b1426] hover:bg-[#540d1e] text-white flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
