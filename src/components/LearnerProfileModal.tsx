import React, { useState, useRef } from 'react';
import { Learner, UserProfile, MarkEntry } from '../types';
import {
  HISTORICAL_LEARNER_PERFORMANCE,
  COMMENT_TEMPLATES,
  SUBJECTS,
} from '../data/initialData';
import {
  X,
  User,
  Calendar,
  Award,
  BookOpen,
  MessageSquare,
  Save,
  CheckCircle2,
  Sparkles,
  Camera,
  Upload,
  Edit3,
  Phone,
  ShieldCheck,
  Check,
  Trash2,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { getRubricFromPoints, getPointsFromScore } from '../utils/grading';

interface LearnerProfileModalProps {
  learner: Learner | null;
  onClose: () => void;
  onUpdateComments: (learnerId: string, general: string, classTeacher: string) => void;
  currentUser: UserProfile;
  onShowSuccessToast: (msg: string) => void;
  onUpdateLearner?: (updatedLearner: Learner) => void;
  marks?: MarkEntry[];
}

export const LearnerProfileModal: React.FC<LearnerProfileModalProps> = ({
  learner,
  onClose,
  onUpdateComments,
  currentUser,
  onShowSuccessToast,
  onUpdateLearner,
  marks = [],
}) => {
  if (!learner) return null;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mode: 'view' (profile status) or 'edit' (edit learner details)
  const [activeMode, setActiveMode] = useState<'view' | 'edit'>('view');

  // Performance Tab: Current Term, Previous Term, Previous Year
  const [termTab, setTermTab] = useState<'current' | 'previous_term' | 'previous_year'>('current');

  // Edit form state
  const [editFirstName, setEditFirstName] = useState(learner.firstName);
  const [editLastName, setEditLastName] = useState(learner.lastName);
  const [editAdmNo, setEditAdmNo] = useState(learner.admNo);
  const [editGrade, setEditGrade] = useState(learner.grade);
  const [editGender, setEditGender] = useState<'M' | 'F'>(learner.gender);
  const [editDob, setEditDob] = useState(learner.dob || '2012-05-14');
  const [editUpiNumber, setEditUpiNumber] = useState(learner.upiNumber || `NEMIS-${learner.admNo}K`);
  const [editGuardianName, setEditGuardianName] = useState(learner.guardianName || '');
  const [editGuardianPhone, setEditGuardianPhone] = useState(learner.guardianPhone || '');
  const [editStatus, setEditStatus] = useState<'Active' | 'Archived' | 'Graduated'>(learner.status || 'Active');
  const [editSpecialNeeds, setEditSpecialNeeds] = useState(learner.specialNeeds || '');
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(learner.photo);

  // Comments state
  const [generalComment, setGeneralComment] = useState(
    learner.comments?.generalComment || ''
  );
  const [classTeacherComment, setClassTeacherComment] = useState(
    learner.comments?.classTeacherComment || ''
  );
  const [isSavedComments, setIsSavedComments] = useState(false);
  const [isSavedDetails, setIsSavedDetails] = useState(false);

  // Handle Photo Upload (Passport Image)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);

      // Save directly to learner
      const updated: Learner = {
        ...learner,
        photo: base64,
      };
      if (onUpdateLearner) {
        onUpdateLearner(updated);
      }
      onShowSuccessToast(`Passport photo updated for ${learner.fullName}.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(undefined);
    const updated: Learner = {
      ...learner,
      photo: undefined,
    };
    if (onUpdateLearner) {
      onUpdateLearner(updated);
    }
    onShowSuccessToast(`Passport photo removed for ${learner.fullName}.`);
  };

  // Save edited learner details
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim() || !editAdmNo.trim()) {
      alert('First name, last name, and admission number are required.');
      return;
    }

    const updated: Learner = {
      ...learner,
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      fullName: `${editFirstName.trim()} ${editLastName.trim()}`,
      admNo: editAdmNo.trim(),
      grade: editGrade,
      gender: editGender,
      dob: editDob,
      upiNumber: editUpiNumber.trim(),
      guardianName: editGuardianName.trim(),
      guardianPhone: editGuardianPhone.trim(),
      status: editStatus,
      specialNeeds: editSpecialNeeds.trim(),
      photo: photoPreview,
    };

    if (onUpdateLearner) {
      onUpdateLearner(updated);
    }

    setIsSavedDetails(true);
    onShowSuccessToast(`Learner details for ${updated.fullName} saved.`);
    setTimeout(() => {
      setIsSavedDetails(false);
      setActiveMode('view');
    }, 1200);
  };

  // Save Comments
  const handleSaveComments = () => {
    onUpdateComments(learner.id, generalComment, classTeacherComment);
    setIsSavedComments(true);
    onShowSuccessToast('Teacher remarks and comments saved.');
    setTimeout(() => setIsSavedComments(false), 2500);
  };

  // Build the complete list of all 9 subjects with scores and points
  const getSubjectsList = () => {
    const historical = HISTORICAL_LEARNER_PERFORMANCE[learner.id];

    if (termTab === 'current') {
      // Return all 9 subjects, checking actual live marks first
      return SUBJECTS.map((subj) => {
        // Find existing mark in marks array
        const markObj = marks.find(
          (m) =>
            (m.learnerId === learner.id || m.admNo === learner.admNo) &&
            m.subject.toLowerCase() === subj.toLowerCase()
        );

        if (markObj) {
          const score100 = markObj.scoreOutOf100 ?? (markObj.points ? markObj.points * 12 : 65);
          const pts = markObj.points ?? getPointsFromScore(score100);
          const assessment = getRubricFromPoints(pts);
          const mark72 = Math.round((score100 / 100) * 72);

          return {
            subject: subj,
            mark: mark72,
            score100,
            level: assessment.level,
            points: pts,
            colorClass: assessment.colorClass,
          };
        }

        // Fallback to historical record or default
        const histSubj = historical?.currentTerm.find((h) => h.subject === subj);
        if (histSubj) {
          const assessment = getRubricFromPoints(histSubj.points);
          return {
            subject: subj,
            mark: histSubj.mark,
            score100: Math.round((histSubj.mark / 72) * 100),
            level: histSubj.level,
            points: histSubj.points,
            colorClass: assessment.colorClass,
          };
        }

        // Standard default for unentered subject
        const defaultMark72 = 56;
        const pts = 7;
        const assessment = getRubricFromPoints(pts);
        return {
          subject: subj,
          mark: defaultMark72,
          score100: Math.round((defaultMark72 / 72) * 100),
          level: assessment.level,
          points: pts,
          colorClass: assessment.colorClass,
        };
      });
    }

    if (termTab === 'previous_term') {
      return SUBJECTS.map((subj) => {
        const histSubj = historical?.previousTerm.find((h) => h.subject === subj);
        const mark72 = histSubj ? histSubj.mark : 52;
        const pts = histSubj ? histSubj.points : 6;
        const assessment = getRubricFromPoints(pts);
        return {
          subject: subj,
          mark: mark72,
          score100: Math.round((mark72 / 72) * 100),
          level: histSubj?.level || assessment.level,
          points: pts,
          colorClass: assessment.colorClass,
        };
      });
    }

    // Previous year
    return SUBJECTS.map((subj) => {
      const histSubj = historical?.previousYear.find((h) => h.subject === subj);
      const mark72 = histSubj ? histSubj.mark : 48;
      const pts = histSubj ? histSubj.points : 5;
      const assessment = getRubricFromPoints(pts);
      return {
        subject: subj,
        mark: mark72,
        score100: Math.round((mark72 / 72) * 100),
        level: histSubj?.level || assessment.level,
        points: pts,
        colorClass: assessment.colorClass,
      };
    });
  };

  const subjectResults = getSubjectsList();
  const totalMarks72 = subjectResults.reduce((acc, curr) => acc + curr.mark, 0);
  const totalPoints = subjectResults.reduce((acc, curr) => acc + curr.points, 0);
  const avgPoints = (totalPoints / subjectResults.length).toFixed(1);
  const avgPercentage = Math.round(
    (subjectResults.reduce((acc, curr) => acc + curr.score100, 0)) / subjectResults.length
  );

  return (
    <div
      id="learner-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto"
    >
      {/* Hidden file input for passport upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Header with Maroon (#6b1426) & Light Blue Theme */}
        <div className="flex items-center justify-between border-b border-[#52101e] bg-[#6b1426] px-5 py-4 text-white">
          <div className="flex items-center gap-4">
            {/* Passport Photo / Avatar with upload trigger */}
            <div className="relative group">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={learner.fullName}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-sky-300 shadow-md bg-white"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-900 text-sky-200 font-extrabold text-lg border-2 border-sky-400/50 shadow-md">
                  {learner.firstName.charAt(0)}
                  {learner.lastName.charAt(0)}
                </div>
              )}

              {/* Quick camera overlay to upload photo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-sky-600 hover:bg-sky-500 text-white p-1.5 rounded-full shadow-lg border border-white transition transform hover:scale-110"
                title="Upload or change passport photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {learner.fullName}
                </h2>
                <span className="text-[11px] font-mono font-black bg-sky-950/80 px-2.5 py-0.5 rounded-lg text-sky-200 border border-sky-500/40">
                  ADM {learner.admNo}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {learner.status}
                </span>
              </div>
              <p className="text-xs text-sky-100/90 mt-0.5 flex items-center gap-2">
                <span>{learner.grade}</span>
                <span>•</span>
                <span>Academic Year: {learner.academicYear}</span>
                <span>•</span>
                <span>{learner.gender === 'M' ? 'Male' : 'Female'}</span>
                {learner.upiNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-sky-200 text-[11px]">UPI: {learner.upiNumber}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Edit Details / View Mode */}
            <button
              onClick={() => setActiveMode(activeMode === 'view' ? 'edit' : 'view')}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/20"
            >
              {activeMode === 'view' ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Status</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-sky-100 hover:bg-white/20 hover:text-white transition"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-stone-700 bg-stone-50/50">
          {activeMode === 'edit' ? (
            /* EDIT LEARNER DETAILS FORM */
            <form onSubmit={handleSaveDetails} className="space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#6b1426]" />
                    <h3 className="font-extrabold text-stone-900 text-base">
                      Edit Learner Information &amp; Passport Photo
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500">Official JSS Admission Record</span>
                </div>

                {/* Passport Photo Upload Section */}
                <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Learner Passport"
                          referrerPolicy="no-referrer"
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-sky-400 shadow-xs"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-2xl bg-white border-2 border-dashed border-sky-300 flex flex-col items-center justify-center text-sky-600 text-xs font-semibold">
                          <User className="w-7 h-7 text-sky-400 mb-1" />
                          <span>No Photo</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">
                        Learner Passport Photo
                      </h4>
                      <p className="text-xs text-stone-600 max-w-sm mt-0.5">
                        Upload standard school passport photo (JPEG, PNG, WEBP). This appears on the learner report cards and official rosters.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{photoPreview ? 'Replace Photo' : 'Upload Photo'}</span>
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      First Name: <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-[#6b1426] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Last Name: <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-[#6b1426] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Admission Number (ADM): <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editAdmNo}
                      onChange={(e) => setEditAdmNo(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-mono font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Junior Secondary Grade:
                    </label>
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none bg-white"
                    >
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Gender:
                    </label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value as 'M' | 'F')}
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none bg-white"
                    >
                      <option value="M">Male (M)</option>
                      <option value="F">Female (F)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Date of Birth:
                    </label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-[#6b1426] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      NEMIS / UPI Number:
                    </label>
                    <input
                      type="text"
                      value={editUpiNumber}
                      onChange={(e) => setEditUpiNumber(e.target.value)}
                      placeholder="e.g. NEMIS-1082K"
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-mono text-stone-900 focus:border-[#6b1426] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Parent / Guardian Name:
                    </label>
                    <input
                      type="text"
                      value={editGuardianName}
                      onChange={(e) => setEditGuardianName(e.target.value)}
                      placeholder="e.g. Richard Kiprotich"
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-[#6b1426] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Parent / Guardian Phone:
                    </label>
                    <input
                      type="text"
                      value={editGuardianPhone}
                      onChange={(e) => setEditGuardianPhone(e.target.value)}
                      placeholder="e.g. +254 722 000 000"
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-[#6b1426] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Special Learning Support / Medical Notes:
                    </label>
                    <input
                      type="text"
                      value={editSpecialNeeds}
                      onChange={(e) => setEditSpecialNeeds(e.target.value)}
                      placeholder="e.g. Needs front row seating for visual clarity; active asthma plan"
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-[#6b1426] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setActiveMode('view')}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition active:scale-95"
                  >
                    {isSavedDetails ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Changes Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Learner Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* VIEW STATUS & PERFORMANCE (ALL 9 SUBJECTS) */
            <>
              {/* Key Facts Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Grade &amp; Stream
                  </span>
                  <div className="text-sm font-black text-stone-900 mt-1">
                    {learner.grade}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Academic Year
                  </span>
                  <div className="text-sm font-black text-stone-900 mt-1">
                    {learner.academicYear} (Term 2)
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Assessment Cycle
                  </span>
                  <div className="text-sm font-black text-emerald-800 mt-1 flex items-center gap-1">
                    <span>Term 3 Active</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Status
                  </span>
                  <div className="text-sm font-bold text-stone-900 mt-1">
                    <span className="inline-block px-2.5 py-0.5 text-[11px] rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                      {learner.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACADEMIC SUBJECT PERFORMANCE - ALL 9 SUBJECTS */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#6b1426]" />
                    <h3 className="font-extrabold text-stone-900 text-base">
                      Academic Subject Performance (All 9 CBC Subjects)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-600">
                      Mean: <strong className="text-sky-800 font-black">{avgPercentage}%</strong> ({avgPoints}/8 pts)
                    </span>
                    <span className="text-[11px] text-stone-400">
                      • Total: {totalMarks72} / 648
                    </span>
                  </div>
                </div>

                {/* Performance Period Tabs */}
                <div className="flex gap-2 border-b border-stone-200 pb-2">
                  <button
                    onClick={() => setTermTab('current')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      termTab === 'current'
                        ? 'bg-[#6b1426] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    CURRENT TERM (Term 2)
                  </button>

                  <button
                    onClick={() => setTermTab('previous_term')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      termTab === 'previous_term'
                        ? 'bg-[#6b1426] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    PREVIOUS TERM (Term 1)
                  </button>

                  <button
                    onClick={() => setTermTab('previous_year')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      termTab === 'previous_year'
                        ? 'bg-[#6b1426] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    PREVIOUS YEAR (2025)
                  </button>
                </div>

                {/* 9 Subjects List with Scores out of 100 & 72, Points (/8), and Rubric Level */}
                <div className="space-y-3 pt-1">
                  {subjectResults.map((item, idx) => {
                    const percentOutOf100 = item.score100;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-stone-50/70 border border-stone-200/80 hover:bg-sky-50/30 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-stone-400 font-bold text-[11px] w-5">
                              {idx + 1}.
                            </span>
                            <span className="font-extrabold text-stone-900">{item.subject}</span>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Score % */}
                            <span className="font-mono font-black text-stone-900 text-xs sm:text-sm bg-white px-2 py-0.5 rounded border border-stone-200">
                              {item.score100}%
                            </span>

                            {/* Mark / 72 */}
                            <span className="font-mono text-xs text-stone-600 hidden sm:inline">
                              {item.mark} / 72
                            </span>

                            {/* Points / 8 */}
                            <span className="font-mono font-bold text-xs text-sky-900 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                              {item.points} pts
                            </span>

                            {/* Rubric Level Badge */}
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${item.colorClass}`}
                            >
                              {item.level}
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentOutOf100 >= 75
                                ? 'bg-emerald-600'
                                : percentOutOf100 >= 50
                                ? 'bg-sky-600'
                                : percentOutOf100 >= 35
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percentOutOf100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GUARDIAN & CONTACT DETAILS */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#6b1426]" />
                    <span>Parent / Guardian &amp; Bio Details</span>
                  </h3>
                  <button
                    onClick={() => setActiveMode('edit')}
                    className="text-xs font-bold text-sky-800 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Bio</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Guardian Name</span>
                    <div className="font-bold text-stone-900 mt-0.5">
                      {learner.guardianName || 'Not recorded'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Guardian Contact</span>
                    <div className="font-bold text-stone-900 mt-0.5 font-mono">
                      {learner.guardianPhone || 'Not recorded'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Date of Birth / UPI</span>
                    <div className="font-bold text-stone-900 mt-0.5">
                      {learner.dob || '2012-05-14'} • {learner.upiNumber || `NEMIS-${learner.admNo}`}
                    </div>
                  </div>
                </div>

                {learner.specialNeeds && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <strong>Special Needs / Notes:</strong> {learner.specialNeeds}
                  </div>
                )}
              </div>

              {/* TEACHER REMARKS & COMMENTS */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#6b1426]" />
                    <span>Teacher Remarks &amp; Comments</span>
                  </h3>
                  <span className="text-xs text-stone-500">Will print on final report card</span>
                </div>

                {/* Quick Comment Templates */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#6b1426]" />
                    <span>Quick Comment Templates (Click to insert into remarks):</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
                    {COMMENT_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setClassTeacherComment(
                            classTeacherComment ? `${classTeacherComment} ${tmpl}` : tmpl
                          );
                        }}
                        className="text-[11px] text-stone-700 bg-white hover:bg-sky-50 hover:text-sky-950 border border-stone-200 px-2 py-1 rounded-lg text-left transition"
                      >
                        + {tmpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* General Learner Comment */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    General Learner Comment:
                  </label>
                  <textarea
                    rows={2}
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    placeholder="e.g. Demonstrates commendable curiosity in practical science and active engagement in group tasks..."
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-800 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                {/* Class Teacher Comment */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Class Teacher Comment:
                  </label>
                  <textarea
                    rows={2}
                    value={classTeacherComment}
                    onChange={(e) => setClassTeacherComment(e.target.value)}
                    placeholder="e.g. A disciplined and dependable learner. Recommended to maintain consistent revision..."
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-800 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-stone-500">
                    Teacher: <strong className="text-stone-700">{currentUser.name}</strong>
                  </span>

                  <button
                    id="save-comments-btn"
                    onClick={handleSaveComments}
                    className="px-4 py-2 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    {isSavedComments ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Saved ✓</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Comments</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-200 bg-stone-50 px-5 py-3 flex justify-between items-center text-xs">
          <span className="text-stone-500">Reberwet Junior Secondary School Learner Record</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMode(activeMode === 'view' ? 'edit' : 'view')}
              className="px-3.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-lg transition"
            >
              {activeMode === 'view' ? 'Edit Details' : 'View Status'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
