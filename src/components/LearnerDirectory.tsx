import React, { useState, useMemo } from 'react';
import { Learner, UserProfile } from '../types';
import { GRADES, SCHOOL_INFO, CLASS_TEACHERS } from '../data/initialData';
import { generateClassLearnersPdf } from '../utils/pdfExport';
import { downloadCsvToFile } from '../utils/fileDownloader';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  GraduationCap,
  Calendar,
  CheckCircle2,
  X,
  FileDown,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  List,
  Phone,
  UserCheck,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';

interface LearnerDirectoryProps {
  learners: Learner[];
  onSelectLearner: (learner: Learner) => void;
  onAddLearner: (newLearner: Learner) => void;
  onUpdateLearners?: (updatedLearners: Learner[]) => void;
  currentUser: UserProfile;
  onNavigateToMarks: () => void;
  onShowSuccessToast?: (msg: string) => void;
}

export const LearnerDirectory: React.FC<LearnerDirectoryProps> = ({
  learners,
  onSelectLearner,
  onAddLearner,
  onUpdateLearners,
  currentUser,
  onNavigateToMarks,
  onShowSuccessToast,
}) => {
  // Filters & Selectors
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'M' | 'F'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 3');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // New learner form fields
  const [newAdm, setNewAdm] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [newGrade, setNewGrade] = useState('Grade 8');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('+254 ');

  // Promotion Form State
  const [promotionSourceGrade, setPromotionSourceGrade] = useState<string>('Grade 7');
  const [promotionTargetGrade, setPromotionTargetGrade] = useState<string>('Grade 8');
  const [promotionTargetYear, setPromotionTargetYear] = useState<string>('2027');
  const [isPromotingAll, setIsPromotingAll] = useState(true);
  const [selectedPromotionLearnerIds, setSelectedPromotionLearnerIds] = useState<string[]>([]);

  const ACADEMIC_YEARS = ['2026', '2027', '2028', '2029', '2030'];

  const notify = (msg: string) => {
    if (onShowSuccessToast) onShowSuccessToast(msg);
  };

  // Filtered learners
  const filteredLearners = useMemo(() => {
    return learners.filter((learner) => {
      // Grade filter
      if (selectedGrade !== 'all' && learner.grade !== selectedGrade) {
        return false;
      }
      // Gender filter
      if (selectedGender !== 'all' && learner.gender !== selectedGender) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = learner.fullName.toLowerCase().includes(q);
        const matchesAdm = learner.admNo.toLowerCase().includes(q);
        const matchesGuardian = learner.guardianName?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesAdm && !matchesGuardian) return false;
      }
      return true;
    });
  }, [learners, selectedGrade, selectedGender, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = learners.length;
    const g7 = learners.filter((l) => l.grade === 'Grade 7').length;
    const g8 = learners.filter((l) => l.grade === 'Grade 8').length;
    const g9 = learners.filter((l) => l.grade === 'Grade 9').length;
    const boys = learners.filter((l) => l.gender === 'M').length;
    const girls = learners.filter((l) => l.gender === 'F').length;

    return { total, g7, g8, g9, boys, girls };
  }, [learners]);

  // Handle Add Learner
  const handleCreateLearner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdm.trim() || !newFirstName.trim() || !newLastName.trim()) {
      alert('Please fill in admission number and full names.');
      return;
    }

    const created: Learner = {
      id: `lrn-${Date.now()}`,
      admNo: newAdm.trim(),
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      fullName: `${newFirstName.trim()} ${newLastName.trim()}`,
      grade: newGrade,
      gender: newGender,
      academicYear: selectedYear,
      status: 'Active',
      attendanceRate: 96,
      guardianName: newGuardianName.trim() || 'Parent / Guardian',
      guardianPhone: newGuardianPhone.trim() || '+254 700 000 000',
    };

    onAddLearner(created);
    setShowAddModal(false);
    setNewAdm('');
    setNewFirstName('');
    setNewLastName('');
    setNewGuardianName('');
    setNewGuardianPhone('+254 ');
    notify(`Learner ${created.fullName} (ADM ${created.admNo}) enrolled successfully.`);
  };

  // Handle Download Class List as PDF
  const handleDownloadClassListPdf = async (gradeToDownload: string) => {
    setShowDownloadMenu(false);
    const targetLearners = gradeToDownload === 'all'
      ? learners
      : learners.filter((l) => l.grade === gradeToDownload);

    if (targetLearners.length === 0) {
      alert(`No learners registered in ${gradeToDownload}.`);
      return;
    }

    const titleGrade = gradeToDownload === 'all' ? 'All Classes (Grade 7, 8 & 9)' : gradeToDownload;
    notify(`Generating PDF register for ${titleGrade}...`);

    const result = await generateClassLearnersPdf(
      gradeToDownload === 'all' ? 'All_Classes' : gradeToDownload,
      targetLearners,
      selectedYear,
      (msg) => notify(msg)
    );

    if (result.success) {
      notify('PDF downloaded successfully. Check your Downloads folder.');
    } else {
      notify(`PDF download failed: ${result.message}`);
    }
  };

  // Handle Download CSV
  const handleExportCsv = (gradeToDownload: string) => {
    setShowDownloadMenu(false);
    const targetLearners = gradeToDownload === 'all'
      ? learners
      : learners.filter((l) => l.grade === gradeToDownload);

    const headers = ['#', 'ADM NO', 'FULL NAME', 'GRADE', 'GENDER', 'GUARDIAN NAME', 'GUARDIAN PHONE', 'ATTENDANCE %', 'ACADEMIC YEAR'];
    const rows = targetLearners.map((lrn, i) => [
      i + 1,
      `"${lrn.admNo}"`,
      `"${lrn.fullName}"`,
      `"${lrn.grade}"`,
      lrn.gender === 'M' ? 'Male' : 'Female',
      `"${lrn.guardianName || ''}"`,
      `"${lrn.guardianPhone || ''}"`,
      `${lrn.attendanceRate}%`,
      lrn.academicYear || selectedYear,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const filename = `Reberwet_JSS_${gradeToDownload.replace(/\s+/g, '_')}_Learners_${selectedYear}`;
    downloadCsvToFile(csvContent, filename);
    notify(`Exported ${targetLearners.length} learners to ${filename}.csv`);
  };

  // Handle Promotion
  const handlePromoteClass = () => {
    if (!onUpdateLearners) {
      alert('Promotion handler not connected.');
      return;
    }

    const learnersToPromote = isPromotingAll
      ? learners.filter((l) => l.grade === promotionSourceGrade && l.status === 'Active')
      : learners.filter((l) => selectedPromotionLearnerIds.includes(l.id));

    if (learnersToPromote.length === 0) {
      alert(`No active learners found in ${promotionSourceGrade} to promote.`);
      return;
    }

    const updatedList = learners.map((l) => {
      const match = learnersToPromote.find((p) => p.id === l.id);
      if (match) {
        return {
          ...l,
          grade: promotionTargetGrade,
          academicYear: promotionTargetYear,
          status: (promotionTargetGrade === 'Graduated' ? 'Graduated' : 'Active') as 'Active' | 'Archived' | 'Graduated',
        };
      }
      return l;
    });

    onUpdateLearners(updatedList);
    setShowPromoteModal(false);
    setSelectedPromotionLearnerIds([]);
    notify(
      `Successfully promoted ${learnersToPromote.length} learners from ${promotionSourceGrade} to ${promotionTargetGrade} for Academic Year ${promotionTargetYear}!`
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#6b1426] via-[#540d1e] to-[#3b0a16] p-6 text-white shadow-lg border border-[#8c1632] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#3b0a16] text-sky-200 border border-sky-300/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                CBC Enrollment &amp; Register
              </span>
              <span className="text-xs text-sky-200/90 font-medium">
                Academic Year {selectedYear} • {selectedTerm}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2.5">
              <Users className="w-8 h-8 text-sky-300" />
              <span>Learners Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-2xl leading-relaxed">
              Official student biodata, admission registers, and class lists. Search learners, download printable registers by grade, and execute annual grade promotions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Download Class List Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3.5 py-2.5 text-xs font-bold shadow-xs transition active:scale-95"
                title="Download class list as PDF or CSV"
              >
                <FileDown className="w-4 h-4 text-sky-300" />
                <span>Download Class List</span>
              </button>

              {showDownloadMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDownloadMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2.5 shadow-2xl border border-stone-200 text-stone-900 z-50 animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider px-2 py-1">
                      Download PDF Register (Device Downloads)
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleDownloadClassListPdf('Grade 7')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-xs font-bold text-[#6b1426] flex items-center justify-between transition"
                      >
                        <span>Grade 7 Register</span>
                        <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded text-[#6b1426]">PDF</span>
                      </button>

                      <button
                        onClick={() => handleDownloadClassListPdf('Grade 8')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 text-xs font-bold text-sky-950 flex items-center justify-between transition"
                      >
                        <span>Grade 8 Register</span>
                        <span className="text-[10px] bg-sky-100 px-1.5 py-0.5 rounded text-sky-900">PDF</span>
                      </button>

                      <button
                        onClick={() => handleDownloadClassListPdf('Grade 9')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-xs font-bold text-amber-950 flex items-center justify-between transition"
                      >
                        <span>Grade 9 Register</span>
                        <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">PDF</span>
                      </button>

                      <button
                        onClick={() => handleDownloadClassListPdf('all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 text-xs font-bold text-stone-900 flex items-center justify-between transition border-t border-stone-100 mt-1"
                      >
                        <span>Complete School List (All)</span>
                        <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-800">PDF</span>
                      </button>
                    </div>

                    <div className="pt-2 mt-2 border-t border-stone-100">
                      <button
                        onClick={() => handleExportCsv(selectedGrade)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center gap-2 transition"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Export as CSV Spreadsheet</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Promote Learners Button */}
            <button
              onClick={() => setShowPromoteModal(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 px-3.5 py-2.5 text-xs font-extrabold shadow-xs transition active:scale-95"
              title="Promote learners to next class at end of academic year"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Promote to Next Class</span>
            </button>

            {/* Add Learner Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-white hover:bg-stone-100 text-[#6b1426] px-3.5 py-2.5 text-xs font-black shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#6b1426]" />
              <span>Add Learner</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-5 border-t border-white/10 text-center">
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/15">
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Total Learners</span>
            <span className="text-xl font-black text-white">{stats.total}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/15">
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Grade 7</span>
            <span className="text-xl font-black text-white">{stats.g7}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/15">
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Grade 8</span>
            <span className="text-xl font-black text-white">{stats.g8}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/15">
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Grade 9</span>
            <span className="text-xl font-black text-white">{stats.g9}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/15">
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Boys</span>
            <span className="text-xl font-black text-white">{stats.boys}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/15">
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Girls</span>
            <span className="text-xl font-black text-white">{stats.girls}</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Live Search */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              id="learner-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by learner name, ADM, or guardian..."
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 pl-10 pr-9 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#6b1426] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Academic Year Selector (2026 to 2030) */}
          <div className="sm:col-span-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-stone-800 focus:border-[#6b1426] focus:outline-none"
            >
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  Academic Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Term Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as any)}
              className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-stone-800 focus:border-[#6b1426] focus:outline-none"
            >
              <option value="Term 3">Term 3 (August – November)</option>
              <option value="Term 2">Term 2 (May – August)</option>
              <option value="Term 1">Term 1 (January – April)</option>
            </select>
          </div>

          {/* List View indicator */}
          <div className="sm:col-span-2 flex items-center justify-end">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6b1426] text-white shadow-xs flex items-center gap-1.5">
              <List className="w-4 h-4" />
              <span>Learners List ({filteredLearners.length})</span>
            </span>
          </div>
        </div>

        {/* Grade & Gender Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
              Class:
            </span>
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                selectedGrade === 'all'
                  ? 'bg-[#6b1426] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Classes ({learners.length})
            </button>

            {GRADES.map((g) => {
              const count = learners.filter((l) => l.grade === g.id).length;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                    selectedGrade === g.id
                      ? 'bg-[#6b1426] text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {g.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
              Gender:
            </span>
            <button
              onClick={() => setSelectedGender('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                selectedGender === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedGender('M')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                selectedGender === 'M'
                  ? 'bg-sky-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Boys
            </button>
            <button
              onClick={() => setSelectedGender('F')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                selectedGender === 'F'
                  ? 'bg-rose-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Girls
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: OFFICIAL ROSTER LIST */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 font-black">
              <tr>
                <th className="p-3.5 text-center w-12">#</th>
                <th className="p-3.5 w-24 text-center font-mono">ADM NO</th>
                <th className="p-3.5 min-w-[200px]">LEARNER NAME</th>
                <th className="p-3.5 text-center w-24">CLASS</th>
                <th className="p-3.5 text-center w-20">GENDER</th>
                <th className="p-3.5 min-w-[180px]">GUARDIAN &amp; CONTACT</th>
                <th className="p-3.5 text-right min-w-[160px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLearners.map((lrn, idx) => (
                <tr key={lrn.id} className="hover:bg-rose-50/40 transition group">
                  <td className="p-3.5 text-center text-stone-400 font-bold">{idx + 1}</td>
                  <td className="p-3.5 text-center">
                    <span className="font-mono font-bold text-[#6b1426] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {lrn.admNo}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-stone-100 text-[#6b1426] font-black text-xs flex items-center justify-center shrink-0 border border-stone-200 group-hover:bg-[#6b1426] group-hover:text-white transition">
                        {lrn.firstName.charAt(0)}{lrn.lastName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-black text-stone-900 text-sm block group-hover:text-[#6b1426] transition">
                          {lrn.fullName}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {lrn.upiNumber || `UPI: Pending`}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="bg-sky-50 text-sky-900 font-black px-2.5 py-1 rounded-xl text-[11px] border border-sky-200">
                      {lrn.grade}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      lrn.gender === 'M' ? 'text-sky-800 bg-sky-50' : 'text-rose-800 bg-rose-50'
                    }`}>
                      {lrn.gender === 'M' ? 'Boy' : 'Girl'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-800 block text-xs">
                        {lrn.guardianName || 'Parent / Guardian'}
                      </span>
                      {lrn.guardianPhone ? (
                        <a
                          href={`tel:${lrn.guardianPhone}`}
                          className="font-mono text-[11px] text-sky-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Phone className="w-3 h-3 text-sky-600" />
                          <span>{lrn.guardianPhone}</span>
                        </a>
                      ) : (
                        <span className="text-stone-400 text-[11px]">No contact registered</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectLearner(lrn)}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-[#6b1426] hover:text-white transition text-stone-700 font-bold text-xs inline-flex items-center gap-1"
                        title="View Learner Profile & History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={onNavigateToMarks}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-[#6b1426] hover:text-white text-[#6b1426] font-bold text-xs inline-flex items-center gap-1 border border-rose-200 transition"
                        title="Enter Marks for this Class"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Marks</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLearners.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-bold text-stone-800 text-sm">No learners found</h3>
          <p className="text-xs text-stone-500">
            No students match your selected grade, gender, or search query.
          </p>
          <button
            onClick={() => {
              setSelectedGrade('all');
              setSelectedGender('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#6b1426] underline pt-2"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* ADD LEARNER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6b1426]" />
                <span>Enroll New Learner</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLearner} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Admission Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 1024"
                    value={newAdm}
                    onChange={(e) => setNewAdm(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 font-mono font-bold focus:border-[#6b1426] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Gender *</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-semibold focus:border-[#6b1426]"
                  >
                    <option value="M">Male (Boy)</option>
                    <option value="F">Female (Girl)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Victor"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 font-semibold focus:border-[#6b1426] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rotich"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 font-semibold focus:border-[#6b1426] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Assigned Grade *</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-semibold focus:border-[#6b1426]"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Academic Year</label>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-bold text-stone-700">
                    {selectedYear}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <label className="block font-bold text-stone-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Mary Rotich"
                  value={newGuardianName}
                  onChange={(e) => setNewGuardianName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 font-semibold focus:border-[#6b1426]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Parent Mobile Phone (SMS / WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={newGuardianPhone}
                  onChange={(e) => setNewGuardianPhone(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 font-mono font-semibold focus:border-[#6b1426]"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs shadow-xs transition active:scale-95"
                >
                  Enroll Learner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTE LEARNERS MODAL */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span>Academic Year Learner Promotion</span>
              </h3>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Transition learners to the next academic level at the end of the school year. Grade 7 advances to Grade 8, Grade 8 advances to Grade 9, and Grade 9 advances to Graduated Alumni.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Automatic Grade Transition Standard:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900 font-medium">
                <li>Grade 7 ➔ Grade 8</li>
                <li>Grade 8 ➔ Grade 9</li>
                <li>Grade 9 ➔ Graduated / JSS CBC Alumni</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Current Class (From)</label>
                <select
                  value={promotionSourceGrade}
                  onChange={(e) => {
                    const src = e.target.value;
                    setPromotionSourceGrade(src);
                    if (src === 'Grade 7') setPromotionTargetGrade('Grade 8');
                    else if (src === 'Grade 8') setPromotionTargetGrade('Grade 9');
                    else if (src === 'Grade 9') setPromotionTargetGrade('Graduated');
                  }}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-bold focus:border-[#6b1426]"
                >
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Promote To (Target)</label>
                <select
                  value={promotionTargetGrade}
                  onChange={(e) => setPromotionTargetGrade(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-bold focus:border-[#6b1426]"
                >
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Graduated">Graduated / Alumni</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-stone-700 mb-1">Target Academic Year</label>
              <select
                value={promotionTargetYear}
                onChange={(e) => setPromotionTargetYear(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-bold focus:border-[#6b1426]"
              >
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope */}
            <div className="pt-2 text-xs">
              <label className="flex items-center gap-2 font-bold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPromotingAll}
                  onChange={(e) => setIsPromotingAll(e.target.checked)}
                  className="rounded text-[#6b1426] focus:ring-[#6b1426]"
                />
                <span>
                  Promote all active learners in {promotionSourceGrade} ({learners.filter((l) => l.grade === promotionSourceGrade).length} students)
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromoteClass}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Promote Class</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
