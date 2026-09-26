import React, { useState } from 'react';
import { UserProfile, TeacherActivity, Announcement } from '../types';
import { SCHOOL_INFO, SUBJECTS } from '../data/initialData';
import { TeachersDetailsModal } from './TeachersDetailsModal';
import { useRealtimeDate } from '../utils/dateService';
import { generateLearningResourcePdf } from '../utils/pdfExport';
import { INITIAL_LEARNING_RESOURCES, LearningResourceItem } from './DocumentCenter';
import {
  BookOpen,
  CheckSquare,
  Users,
  FileText,
  Megaphone,
  FolderOpen,
  User,
  GraduationCap,
  Clock,
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Mail,
  ShieldCheck,
  LogIn,
  Upload,
  Download,
  FileDown,
  Layers,
  Search,
  X,
  Plus,
  Check,
  Award,
  Activity,
  History,
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: UserProfile | null;
  teachers: UserProfile[];
  onNavigate: (view: string) => void;
  activities: TeacherActivity[];
  announcements: Announcement[];
  pendingMarksCount: number;
  onUpdateTeachers: (updated: UserProfile[]) => void;
  onOpenGmail: () => void;
  onOpenAuthModal: () => void;
  onShowSuccessToast: (msg: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  teachers,
  onNavigate,
  activities,
  announcements,
  pendingMarksCount,
  onUpdateTeachers,
  onOpenGmail,
  onOpenAuthModal,
  onShowSuccessToast,
}) => {
  const { formattedDate } = useRealtimeDate();
  const [teachersModalOpen, setTeachersModalOpen] = useState(false);

  // New Modals for Academic Management Modules
  const [recentActivitiesModalOpen, setRecentActivitiesModalOpen] = useState(false);
  const [announcementsModalOpen, setAnnouncementsModalOpen] = useState(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);
  const [uploadResourceModalOpen, setUploadResourceModalOpen] = useState(false);

  // Local Resources State on Home Screen
  const [homeResources, setHomeResources] = useState<LearningResourceItem[]>(() => INITIAL_LEARNING_RESOURCES);
  const [resourceFilterGrade, setResourceFilterGrade] = useState<'all' | 'Grade 7' | 'Grade 8' | 'Grade 9'>('all');
  const [resourceCategory, setResourceCategory] = useState<string>('all');
  const [resourceSearch, setResourceSearch] = useState('');

  // Resource Upload Form State
  const [newResTitle, setNewResTitle] = useState('');
  const [newResGrade, setNewResGrade] = useState<'Grade 7' | 'Grade 8' | 'Grade 9'>('Grade 8');
  const [newResSubject, setNewResSubject] = useState('Mathematics');
  const [newResCategory, setNewResCategory] = useState<'Schemes of Work' | 'Revision Notes' | 'Assessment Papers' | 'Lesson Plans'>('Revision Notes');
  const [newResContent, setNewResContent] = useState('');
  const [newResFile, setNewResFile] = useState<File | null>(null);

  // Search in Recent Activities modal
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategory, setActivityCategory] = useState<'all' | 'marks' | 'document' | 'circular' | 'system'>('all');

  // Search in Announcements modal
  const [announcementSearch, setAnnouncementSearch] = useState('');

  // Filtered Activities
  const filteredActivities = activities.filter((act) => {
    if (activityCategory !== 'all' && act.category !== activityCategory) return false;
    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase().trim();
      return act.action.toLowerCase().includes(q) || act.details?.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    if (announcementSearch.trim()) {
      const q = announcementSearch.toLowerCase().trim();
      return ann.title.toLowerCase().includes(q) || ann.message.toLowerCase().includes(q) || ann.author.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Home Resources
  const filteredHomeResources = homeResources.filter((res) => {
    if (resourceFilterGrade !== 'all' && res.grade !== resourceFilterGrade) return false;
    if (resourceCategory !== 'all' && res.category !== resourceCategory) return false;
    if (resourceSearch.trim()) {
      const q = resourceSearch.toLowerCase().trim();
      return (
        res.title.toLowerCase().includes(q) ||
        res.subject.toLowerCase().includes(q) ||
        res.content.toLowerCase().includes(q) ||
        res.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Home Resource PDF Download
  const handleDownloadResourcePdf = async (res: LearningResourceItem) => {
    onShowSuccessToast(`Downloading "${res.title}"...`);
    const result = await generateLearningResourcePdf({
      title: res.title,
      grade: res.grade,
      subject: res.subject,
      category: res.category,
      term: res.term,
      author: res.author,
      date: res.date,
      content: res.content,
      keyOutcomes: res.keyOutcomes,
    }, (msg) => onShowSuccessToast(msg));

    if (result.success) {
      onShowSuccessToast('PDF downloaded successfully. Check your Downloads folder.');
    } else {
      onShowSuccessToast(`PDF download failed: ${result.message}`);
    }
  };

  // Handle Upload Resource Form
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) {
      alert('Please enter a resource title.');
      return;
    }

    const created: LearningResourceItem = {
      id: `res-${Date.now()}`,
      title: newResTitle.trim(),
      grade: newResGrade,
      subject: newResSubject,
      category: newResCategory,
      term: 'Term 3',
      fileType: 'PDF',
      fileSize: newResFile ? `${(newResFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
      author: currentUser?.name || 'Teacher Staff',
      date: new Date().toISOString().slice(0, 10),
      content: newResContent.trim() || `CBC curriculum teaching notes for ${newResSubject} (${newResGrade}). Prepared by ${currentUser?.name || 'Teacher Staff'}.`,
      keyOutcomes: [
        `Understand core competency strands in ${newResSubject}.`,
        'Demonstrate practical learner problem-solving.',
        'Complete formative curriculum evaluations.',
      ],
    };

    setHomeResources((prev) => [created, ...prev]);
    setUploadResourceModalOpen(false);
    setNewResTitle('');
    setNewResContent('');
    setNewResFile(null);
    onShowSuccessToast(`Resource "${created.title}" uploaded successfully.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Auth on Top Screen */}
      <div className="rounded-3xl bg-gradient-to-br from-[#6b1426] via-[#540d1e] to-[#3b0a16] p-5 sm:p-7 text-white shadow-md border border-[#8c1632] relative overflow-hidden">
        {/* Subtle decorative crest watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-sky-200" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#8c1632]/80 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Hello, {currentUser?.name || 'Teacher Staff'}
                </h1>
                <span className="bg-[#3b0a16] text-sky-200 border border-sky-300/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {currentUser?.role === 'super_admin' ? 'Head Teacher' : currentUser?.role === 'school_admin' ? 'School Admin' : 'Teacher Seat'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-sky-100">
                <span className="font-bold text-sky-200">Allocated Teaching:</span>
                {currentUser?.assignments && currentUser.assignments.length > 0 ? (
                  currentUser.assignments.map((asgn, i) => (
                    <span
                      key={i}
                      className="bg-[#3b0a16]/80 border border-sky-300/40 px-2 py-0.5 rounded-md font-semibold text-sky-100"
                    >
                      {asgn.grade} • {asgn.subject}
                    </span>
                  ))
                ) : (
                  <span className="text-sky-200">School Administration</span>
                )}
              </div>
            </div>

            {/* Academic Year, Term & Actions */}
            <div className="flex flex-wrap items-center gap-2 text-xs self-start md:self-auto font-medium">
              <div className="bg-[#3b0a16]/80 p-2 rounded-xl border border-[#8c1632] text-sky-100 flex items-center gap-2">
                <span>{SCHOOL_INFO.currentYear} • {SCHOOL_INFO.currentTerm}</span>
                <span className="text-rose-400">|</span>
                <span className="text-white font-semibold">{formattedDate}</span>
              </div>

              {/* Login / Switch Account Button */}
              <button
                onClick={onOpenAuthModal}
                id="top-screen-auth-btn"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 text-xs shadow-xs"
                title="Sign Up or Log In (Username, Password or Biometrics)"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-300" />
                <span>Sign Up / Sign In</span>
              </button>
            </div>
          </div>

          {/* Quick status notice if pending marks */}
          {pendingMarksCount > 0 && (
            <div className="flex items-center justify-between bg-sky-950/50 border border-sky-400/40 rounded-xl px-3.5 py-2 text-xs text-sky-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-sky-300 shrink-0" />
                <span>
                  <strong>{pendingMarksCount} learners</strong> in your assigned classes require assessment marks.
                </span>
              </div>
              <button
                onClick={() => onNavigate('marks')}
                className="font-bold underline text-white hover:text-sky-200 shrink-0 ml-2"
              >
                Enter marks now →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6b1426]" />
            <span>Quick Actions</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Enter Marks */}
          <button
            id="quick-action-enter-marks"
            onClick={() => onNavigate('marks')}
            className="group relative flex flex-col items-start p-4 bg-white hover:bg-rose-50/50 rounded-2xl border-2 border-stone-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#6b1426] group-hover:bg-[#6b1426] group-hover:text-white transition mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-base font-extrabold text-stone-900 group-hover:text-[#6b1426]">
              Enter Marks
            </div>
            <div className="text-xs text-stone-500 mt-1 line-clamp-1">
              Independent % Score &amp; Rubrics
            </div>
            {pendingMarksCount > 0 && (
              <span className="mt-2 text-[10px] font-bold bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full border border-sky-300">
                {pendingMarksCount} Pending
              </span>
            )}
          </button>

          {/* Reports & Broadsheet (Replaced Gmail Desk with Reports) */}
          <button
            id="quick-action-reports"
            onClick={() => onNavigate('reports')}
            className="group relative flex flex-col items-start p-4 bg-white hover:bg-sky-50/50 rounded-2xl border-2 border-stone-200 hover:border-sky-700 shadow-xs hover:shadow-md transition text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-800 group-hover:bg-sky-700 group-hover:text-white transition mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-base font-extrabold text-stone-900 group-hover:text-sky-950">
              Reports
            </div>
            <div className="text-xs text-stone-500 mt-1 line-clamp-1">
              Broadsheet &amp; Report Cards
            </div>
          </button>

          {/* Teachers Details */}
          <button
            id="quick-action-teachers-details"
            onClick={() => setTeachersModalOpen(true)}
            className="group relative flex flex-col items-start p-4 bg-white hover:bg-rose-50/50 rounded-2xl border-2 border-stone-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#6b1426] group-hover:bg-[#6b1426] group-hover:text-white transition mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-base font-extrabold text-stone-900 group-hover:text-[#6b1426]">
              Teachers Details
            </div>
            <div className="text-xs text-stone-500 mt-1 line-clamp-1">
              Faculty roster &amp; contacts
            </div>
          </button>
        </div>
      </div>

      {/* Teachers Details Modal */}
      <TeachersDetailsModal
        isOpen={teachersModalOpen}
        onClose={() => setTeachersModalOpen(false)}
        teachers={teachers}
        currentUser={currentUser || DEFAULT_USERS[0]}
        onUpdateTeachers={onUpdateTeachers}
        onShowSuccessToast={onShowSuccessToast}
      />

      {/* Section 2: Academic Management Modules */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          Academic Management Modules
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* MY CLASSES */}
          <button
            id="module-my-classes"
            onClick={() => onNavigate('classes')}
            className="flex flex-col p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#6b1426] group-hover:bg-[#6b1426] group-hover:text-white transition mb-2.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-[#6b1426]">
              MY CLASSES
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Grade 7, 8 &amp; 9</div>
          </button>

          {/* ALL LEARNERS */}
          <button
            id="module-all-learners"
            onClick={() => onNavigate('learners')}
            className="flex flex-col p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800 group-hover:bg-[#6b1426] group-hover:text-white transition mb-2.5">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-[#6b1426]">
              ALL LEARNERS
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Directory &amp; Register</div>
          </button>

          {/* REPORTS & BROADSHEET (Replaced Gmail Desk position with Reports) */}
          <button
            id="module-reports"
            onClick={() => onNavigate('reports')}
            className="flex flex-col p-4 rounded-2xl bg-white border-2 border-sky-300 hover:border-sky-600 shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800 group-hover:bg-sky-700 group-hover:text-white transition mb-2.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-sky-950">
              REPORTS
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Broadsheet &amp; Report Cards</div>
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-sky-600" />
          </button>

          {/* TEACHING & LEARNING RESOURCES */}
          <button
            id="module-resources"
            onClick={() => setResourcesModalOpen(true)}
            className="flex flex-col p-4 rounded-2xl bg-white border-2 border-emerald-300 hover:border-emerald-600 shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition mb-2.5">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-emerald-950">
              RESOURCES
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Upload &amp; Download</div>
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-emerald-600" />
          </button>

          {/* ENTER MARKS */}
          <button
            id="module-marks"
            onClick={() => onNavigate('marks')}
            className="flex flex-col p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#6b1426] group-hover:bg-[#6b1426] group-hover:text-white transition mb-2.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-[#6b1426]">
              ENTER MARKS
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Scores &amp; Rubrics</div>
          </button>

          {/* TEACHERS DETAILS */}
          <button
            id="module-teachers-details"
            onClick={() => setTeachersModalOpen(true)}
            className="flex flex-col p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#6b1426] group-hover:bg-[#6b1426] group-hover:text-white transition mb-2.5">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-[#6b1426]">
              TEACHERS DETAILS
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Staff &amp; Roster</div>
          </button>

          {/* YOUR RECENT ACTIVITY */}
          <button
            id="module-recent-activity"
            onClick={() => setRecentActivitiesModalOpen(true)}
            className="flex flex-col p-4 rounded-2xl bg-white border-2 border-rose-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-[#6b1426] group-hover:bg-[#6b1426] group-hover:text-white transition mb-2.5">
              <History className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-[#6b1426]">
              RECENT ACTIVITY
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Full Log of Actions</div>
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-[#6b1426]" />
          </button>

          {/* SCHOOL ANNOUNCEMENTS */}
          <button
            id="module-announcements"
            onClick={() => setAnnouncementsModalOpen(true)}
            className="flex flex-col p-4 rounded-2xl bg-white border-2 border-sky-200 hover:border-sky-600 shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 group-hover:bg-sky-700 group-hover:text-white transition mb-2.5">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-sky-950">
              ANNOUNCEMENTS
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">School Circulars</div>
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-sky-600" />
          </button>

          {/* MY PROFILE */}
          <button
            id="module-my-profile"
            onClick={() => onNavigate('profile')}
            className="flex flex-col p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#6b1426] shadow-xs hover:shadow-md transition text-left active:scale-[0.98] group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 group-hover:bg-amber-700 group-hover:text-white transition mb-2.5">
              <User className="w-5 h-5" />
            </div>
            <div className="text-sm font-extrabold text-stone-900 group-hover:text-amber-950">
              MY PROFILE
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Staff Credentials</div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL: YOUR RECENT ACTIVITY (Full List of Teacher Activities) */}
      {/* ========================================================================= */}
      {recentActivitiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6b1426] to-[#540d1e] text-white px-6 py-4 flex items-center justify-between border-b border-[#8c1632] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200 border border-white/20">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Your Recent Activity Log</h3>
                  <p className="text-xs text-sky-100/90">
                    Audit log of actions performed by {currentUser?.name || 'Teacher Staff'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecentActivitiesModalOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-stone-100 bg-stone-50 space-y-2.5 shrink-0 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Search your activities..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-stone-500 uppercase mr-1">Category:</span>
                {(['all', 'marks', 'document', 'circular'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivityCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                      activityCategory === cat
                        ? 'bg-[#6b1426] text-white'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#6b1426] font-bold mt-0.5">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm block">
                          {act.action}
                        </span>
                        {act.details && (
                          <p className="text-xs text-stone-600 mt-0.5">{act.details}</p>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-1 inline-block">
                          Category: {act.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-stone-500 shrink-0">
                      {act.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-500 text-xs">
                  No matching activities found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex justify-end shrink-0">
              <button
                onClick={() => setRecentActivitiesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL: SCHOOL ANNOUNCEMENTS (Full List of School Circulars) */}
      {/* ========================================================================= */}
      {announcementsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6b1426] to-[#540d1e] text-white px-6 py-4 flex items-center justify-between border-b border-[#8c1632] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200 border border-white/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">School Announcements &amp; Circulars</h3>
                  <p className="text-xs text-sky-100/90">
                    Official internal notices and communications for Reberwet JSS staff
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAnnouncementsModalOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-stone-100 bg-stone-50 shrink-0 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={announcementSearch}
                  onChange={(e) => setAnnouncementSearch(e.target.value)}
                  placeholder="Search announcements by title or content..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 focus:border-[#6b1426] focus:outline-none"
                />
              </div>
            </div>

            {/* Announcements List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-stone-900 text-sm">
                        {ann.title}
                      </h4>
                      <span className="text-[10px] font-bold bg-rose-100 text-[#6b1426] px-2 py-0.5 rounded-md shrink-0">
                        {ann.category}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {ann.message}
                    </p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                      <span>Author: <strong>{ann.author}</strong></span>
                      <span>{ann.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-500 text-xs">
                  No announcements match your search.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex justify-end shrink-0">
              <button
                onClick={() => setAnnouncementsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: TEACHING & LEARNING RESOURCES HUB */}
      {/* ========================================================================= */}
      {resourcesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6b1426] to-[#540d1e] text-white px-6 py-4 flex items-center justify-between border-b border-[#8c1632] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200 border border-white/20">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Teaching &amp; Learning Resources Hub</h3>
                  <p className="text-xs text-sky-100/90">
                    Schemes of work, revision notes, assessment papers &amp; lesson plans
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUploadResourceModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#6b1426] hover:bg-rose-50 text-xs font-black shadow-xs transition active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resource</span>
                </button>
                <button
                  onClick={() => setResourcesModalOpen(false)}
                  className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-stone-100 bg-stone-50 space-y-2.5 shrink-0 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Search resources by title, subject, or content..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Grade filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-500 uppercase mr-1">Grade:</span>
                  {(['all', 'Grade 7', 'Grade 8', 'Grade 9'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setResourceFilterGrade(g)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                        resourceFilterGrade === g
                          ? 'bg-[#6b1426] text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {g === 'all' ? 'All Grades' : g}
                    </button>
                  ))}
                </div>

                {/* Category filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-500 uppercase mr-1">Category:</span>
                  {(['all', 'Revision Notes', 'Schemes of Work', 'Assessment Papers', 'Lesson Plans'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setResourceCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                        resourceCategory === cat
                          ? 'bg-sky-800 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {filteredHomeResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredHomeResources.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#6b1426] transition flex flex-col justify-between space-y-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-black uppercase bg-rose-100 text-[#6b1426] px-2 py-0.5 rounded-md">
                            {res.category}
                          </span>
                          <span className="text-[10px] font-bold text-stone-500">
                            {res.grade} • {res.subject}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-stone-900 text-sm mt-2 line-clamp-2 leading-snug">
                          {res.title}
                        </h4>

                        <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                          {res.content}
                        </p>

                        {res.keyOutcomes && res.keyOutcomes.length > 0 && (
                          <div className="mt-2 text-[10.5px] text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-100 space-y-0.5">
                            <span className="font-bold text-stone-700 block">Outcomes:</span>
                            {res.keyOutcomes.slice(0, 2).map((out, i) => (
                              <div key={i} className="truncate">• {out}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-500 font-medium">
                          {res.author} • {res.date}
                        </span>

                        <button
                          onClick={() => handleDownloadResourcePdf(res)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-[#6b1426] text-white font-bold text-xs shadow-xs transition active:scale-95"
                          title="Download resource directly as PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-stone-500 text-xs">
                  No teaching resources match your selected filters.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between shrink-0 text-xs">
              <button
                onClick={() => {
                  setResourcesModalOpen(false);
                  onNavigate('documents');
                }}
                className="font-bold text-[#6b1426] hover:underline flex items-center gap-1"
              >
                <span>Open Full Document Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setResourcesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: UPLOAD TEACHING RESOURCE */}
      {/* ========================================================================= */}
      {uploadResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#6b1426]" />
                <span>Upload Teaching Resource</span>
              </h3>
              <button
                onClick={() => setUploadResourceModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 8 Mathematics - Linear Equations Summary Notes"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 font-semibold focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Grade *</label>
                  <select
                    value={newResGrade}
                    onChange={(e) => setNewResGrade(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-bold focus:border-[#6b1426]"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Subject *</label>
                  <select
                    value={newResSubject}
                    onChange={(e) => setNewResSubject(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-bold focus:border-[#6b1426]"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Category *</label>
                <select
                  value={newResCategory}
                  onChange={(e) => setNewResCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-bold focus:border-[#6b1426]"
                >
                  <option value="Revision Notes">Revision Notes</option>
                  <option value="Schemes of Work">Schemes of Work</option>
                  <option value="Assessment Papers">Assessment Papers</option>
                  <option value="Lesson Plans">Lesson Plans</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Summary Content / Key Notes</label>
                <textarea
                  rows={3}
                  placeholder="Outline key learning outcomes, strands, or exam notes..."
                  value={newResContent}
                  onChange={(e) => setNewResContent(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-medium focus:border-[#6b1426]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Attach File (Optional PDF / DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.csv"
                  onChange={(e) => setNewResFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-300 p-2 text-stone-700 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-[#6b1426]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadResourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#520e1c] text-white font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resource</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
