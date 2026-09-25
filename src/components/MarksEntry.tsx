import React, { useState, useEffect, useMemo } from 'react';
import { Learner, MarkEntry, UserProfile } from '../types';
import { GRADES, SUBJECTS, TERMS } from '../data/initialData';
import {
  ASSESSMENT_LEVELS,
  getRubricByCode,
  validateMarkInput,
  validatePointsInput,
} from '../utils/grading';
import { StorageService, TeacherLastSelection } from '../utils/storage';
import { NativeBridge } from '../utils/nativeBridge';
import {
  Save,
  CheckCircle2,
  Filter,
  Search,
  HelpCircle,
  X,
  RefreshCw,
  Eye,
  BookOpen,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';

interface MarksEntryProps {
  learners: Learner[];
  marks: MarkEntry[];
  onSaveMarks: (updatedMarks: MarkEntry[]) => void;
  currentUser: UserProfile;
  isSimulatedOffline: boolean;
  onOpenHelp: () => void;
  onSelectLearner: (learner: Learner) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  onShowSuccessToast: (msg: string) => void;
}

export const MarksEntry: React.FC<MarksEntryProps> = ({
  learners,
  marks,
  onSaveMarks,
  currentUser,
  isSimulatedOffline,
  onOpenHelp,
  onSelectLearner,
  setHasUnsavedChanges,
  onShowSuccessToast,
}) => {
  // Load remembered teacher selection
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return StorageService.getLastSelection().grade || 'Grade 8';
  });
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    return StorageService.getLastSelection().subject || 'Mathematics';
  });
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(() => {
    return StorageService.getLastSelection().term || 'Term 3';
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return StorageService.getLastSelection().academicYear || '2026';
  });

  const ACADEMIC_YEARS = ['2026', '2027', '2028', '2029', '2030'];

  // Filter missing marks toggle
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // INDEPENDENT states for % Score, Points, and Rubrics (no connection between %score and points/rubric)
  const [localScores, setLocalScores] = useState<Record<string, string>>({});
  const [localPoints, setLocalPoints] = useState<Record<string, number | null>>({});
  const [localLevels, setLocalLevels] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save safety status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline' | 'error'>('saved');

  // Guided banner
  const [showGuideBanner, setShowGuideBanner] = useState<boolean>(() => {
    return !StorageService.hasSeenFirstMarksHelp();
  });

  // Remember selection when changed
  useEffect(() => {
    const selection: TeacherLastSelection = {
      grade: selectedGrade,
      stream: '',
      subject: selectedSubject,
      term: selectedTerm,
      academicYear: selectedYear,
    };
    StorageService.saveLastSelection(selection);
  }, [selectedGrade, selectedSubject, selectedTerm, selectedYear]);

  // Sync unSavedChanges flag to parent
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  // Get active learners in selected Grade
  const classLearners = useMemo(() => {
    return learners.filter(
      (l) => l.grade === selectedGrade && l.status === 'Active'
    );
  }, [learners, selectedGrade]);

  // Initialize local marks mapping whenever Class, Subject, Term, or Year changes
  useEffect(() => {
    const scoreMap: Record<string, string> = {};
    const pointsMap: Record<string, number | null> = {};
    const levelsMap: Record<string, string> = {};

    classLearners.forEach((learner) => {
      const existing = marks.find(
        (m) =>
          m.learnerId === learner.id &&
          m.subject === selectedSubject &&
          m.term === selectedTerm &&
          m.academicYear === selectedYear
      );

      if (existing) {
        // Load % score independently
        if (existing.scoreOutOf100 !== undefined && existing.scoreOutOf100 !== null) {
          scoreMap[learner.id] = String(existing.scoreOutOf100);
        } else {
          scoreMap[learner.id] = '';
        }

        // Load points independently
        pointsMap[learner.id] = existing.points ?? null;

        // Load assessment level independently
        levelsMap[learner.id] = existing.assessmentLevel || '—';
      } else {
        scoreMap[learner.id] = '';
        pointsMap[learner.id] = null;
        levelsMap[learner.id] = '—';
      }
    });

    setLocalScores(scoreMap);
    setLocalPoints(pointsMap);
    setLocalLevels(levelsMap);
    setValidationErrors({});
    setIsDirty(false);
    setSaveStatus('saved');
  }, [classLearners, marks, selectedSubject, selectedTerm, selectedYear]);

  // Handle % Score Change: ONLY changes scoreOutOf100, NEVER points or rubric level!
  const handleScoreChange = (learnerId: string, val: string) => {
    setIsDirty(true);
    setSaveStatus('saving');

    setLocalScores((prev) => ({
      ...prev,
      [learnerId]: val,
    }));

    const validation = validateMarkInput(val);
    if (!validation.isValid && validation.errorMessage) {
      setValidationErrors((prev) => ({
        ...prev,
        [learnerId]: validation.errorMessage!,
      }));
    } else {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[learnerId];
        return next;
      });
    }

    const timer = setTimeout(() => {
      if (isSimulatedOffline) {
        setSaveStatus('offline');
      } else {
        setSaveStatus('saved');
      }
    }, 600);

    return () => clearTimeout(timer);
  };

  // Handle Points Change: ONLY changes points, NEVER % score!
  const handlePointsChange = (learnerId: string, pts: number | null) => {
    setIsDirty(true);
    setSaveStatus('saving');

    setLocalPoints((prev) => ({
      ...prev,
      [learnerId]: pts,
    }));

    const timer = setTimeout(() => {
      if (isSimulatedOffline) {
        setSaveStatus('offline');
      } else {
        setSaveStatus('saved');
      }
    }, 600);

    return () => clearTimeout(timer);
  };

  // Handle Rubric Level Change: ONLY changes assessmentLevel, NEVER % score!
  const handleLevelChange = (learnerId: string, level: string) => {
    setIsDirty(true);
    setSaveStatus('saving');

    setLocalLevels((prev) => ({
      ...prev,
      [learnerId]: level,
    }));

    const timer = setTimeout(() => {
      if (isSimulatedOffline) {
        setSaveStatus('offline');
      } else {
        setSaveStatus('saved');
      }
    }, 600);

    return () => clearTimeout(timer);
  };

  // Completion calculation
  const totalLearnersCount = classLearners.length;
  const completedLearnersCount = useMemo(() => {
    return classLearners.filter((l) => {
      const scoreVal = localScores[l.id];
      const ptsVal = localPoints[l.id];
      const levelVal = localLevels[l.id];

      const hasScore = scoreVal && scoreVal.trim() !== '' && !isNaN(Number(scoreVal));
      const hasPts = ptsVal !== null && ptsVal !== undefined;
      const hasLevel = levelVal && levelVal !== '—';

      return hasScore || hasPts || hasLevel;
    }).length;
  }, [classLearners, localScores, localPoints, localLevels]);

  const completionPercentage =
    totalLearnersCount > 0
      ? Math.round((completedLearnersCount / totalLearnersCount) * 100)
      : 0;

  // Filtered learners list
  const displayedLearners = useMemo(() => {
    return classLearners.filter((l) => {
      if (showMissingOnly) {
        const scoreVal = localScores[l.id];
        const ptsVal = localPoints[l.id];
        const levelVal = localLevels[l.id];
        const hasData =
          (scoreVal && scoreVal.trim() !== '' && !isNaN(Number(scoreVal))) ||
          ptsVal !== null ||
          (levelVal && levelVal !== '—');
        if (hasData) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = l.fullName.toLowerCase().includes(q);
        const matchesAdm = l.admNo.toLowerCase().includes(q);
        if (!matchesName && !matchesAdm) return false;
      }

      return true;
    });
  }, [classLearners, showMissingOnly, searchQuery, localScores, localPoints, localLevels]);

  // Explicit Save Marks handler
  const handleSaveMarks = () => {
    if (Object.keys(validationErrors).length > 0) {
      alert('Please correct invalid % scores before saving. Scores must be between 0 and 100.');
      return;
    }

    setSaveStatus('saving');
    const updated = [...marks];

    classLearners.forEach((learner) => {
      const rawScore = localScores[learner.id];
      const validation = validateMarkInput(rawScore || '');
      if (!validation.isValid) return;

      const numericScore = validation.value;
      const currentPts = localPoints[learner.id] ?? null;
      const currentLevel = localLevels[learner.id] || '—';

      const existingIndex = updated.findIndex(
        (m) =>
          m.learnerId === learner.id &&
          m.subject === selectedSubject &&
          m.term === selectedTerm &&
          m.academicYear === selectedYear
      );

      const newEntry: MarkEntry = {
        id: existingIndex >= 0 ? updated[existingIndex].id : `m-${learner.id}-${Date.now()}`,
        learnerId: learner.id,
        admNo: learner.admNo,
        grade: selectedGrade,
        subject: selectedSubject,
        term: selectedTerm,
        academicYear: selectedYear,
        scoreOutOf100: numericScore,
        markOutOf72: null, // Separated completely per requirement
        points: currentPts,
        assessmentLevel: currentLevel,
        lastModifiedBy: currentUser.name,
        lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      if (existingIndex >= 0) {
        updated[existingIndex] = newEntry;
      } else if (numericScore !== null || currentPts !== null || currentLevel !== '—') {
        updated.push(newEntry);
      }
    });

    onSaveMarks(updated);
    setIsDirty(false);
    NativeBridge.vibrate(35);

    if (isSimulatedOffline) {
      setSaveStatus('offline');
      NativeBridge.showToast('Saved locally while offline');
      onShowSuccessToast('Saved locally — changes stored temporarily while offline.');
    } else {
      setSaveStatus('saved');
      NativeBridge.showToast('Marks saved successfully');
      onShowSuccessToast('Marks saved successfully. Independent score & rubric metrics recorded.');
    }
  };

  const dismissGuideBanner = () => {
    setShowGuideBanner(false);
    StorageService.setFirstMarksHelpSeen();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Help Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#6b1426]" />
            <span>Enter Marks</span>
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Record learner performance. <strong>% Score (x/100)</strong> operates independently with no forced connection to points or rubric levels.
          </p>
        </div>

        {/* Auto-save status badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving changes…</span>
            </span>
          )}

          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Saved to Database</span>
            </span>
          )}

          {saveStatus === 'offline' && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
              <span>Offline — cached on device</span>
            </span>
          )}

          <button
            onClick={onOpenHelp}
            className="text-xs font-semibold text-[#6b1426] hover:text-[#540d1e] flex items-center gap-1 ml-1 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Grading Rules</span>
          </button>
        </div>
      </div>

      {/* Independent Assessment Architecture Notice */}
      <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-200/60 rounded-xl text-amber-900 shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <strong className="block font-bold text-amber-950 text-xs sm:text-sm">
              Separated Scoring &amp; CBC Rubrics Architecture
            </strong>
            <p className="text-[11px] text-amber-900 mt-0.5">
              The <strong>% Score (x/100)</strong> works completely separately from <strong>Points (1–8)</strong> and <strong>Rubric Level</strong>. Entering a % score will never change points or rubrics, and choosing a rubric level will never modify the % score.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Independent Metric Fields</span>
        </div>
      </div>

      {/* Guide Banner */}
      {showGuideBanner && (
        <div className="rounded-2xl bg-rose-50/60 border border-rose-200 p-4 relative shadow-2xs">
          <button
            onClick={dismissGuideBanner}
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-md"
            title="Dismiss instruction"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#6b1426] text-white font-bold text-xs">
              i
            </span>
            <div className="text-xs text-stone-800 space-y-1 pr-6">
              <strong className="block text-sm font-bold text-stone-900">How to Record Marks &amp; Rubrics:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-medium">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <strong className="text-[#6b1426] block text-[11px]">1. Class &amp; Subject</strong>
                  Pick grade &amp; subject
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <strong className="text-[#6b1426] block text-[11px]">2. % Score (0–100)</strong>
                  Enter raw score %
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <strong className="text-[#6b1426] block text-[11px]">3. Points &amp; Rubric</strong>
                  Optionally select level (EE1–BE2)
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <strong className="text-[#6b1426] block text-[11px]">4. Save Changes</strong>
                  Click SAVE MARKS button
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS & SELECTORS */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Class */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
              Select Grade
            </label>
            <select
              id="select-marks-grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:border-[#6b1426] focus:ring-1 focus:ring-[#6b1426]"
            >
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
              Teaching Subject
            </label>
            <select
              id="select-marks-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:border-[#6b1426] focus:ring-1 focus:ring-[#6b1426]"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Term & Year */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
              Term &amp; Academic Year
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                id="select-marks-term"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as any)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:border-[#6b1426] focus:ring-1 focus:ring-[#6b1426]"
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                id="select-marks-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:border-[#6b1426] focus:ring-1 focus:ring-[#6b1426]"
              >
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Remembered selection notification */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-stone-500">
          <span>Active Assessment View:</span>
          <span className="font-bold text-[#6b1426]">
            {selectedGrade} • {selectedSubject} • {selectedTerm} ({selectedYear})
          </span>
        </div>
      </div>

      {/* Completion Indicator & Missing Marks Filter */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <span>Marks Progress:</span>
              <span className="text-[#6b1426] text-base">{completionPercentage}%</span>
              <span className="text-xs font-semibold text-stone-500">
                ({completedLearnersCount} / {totalLearnersCount} learners entered)
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {totalLearnersCount - completedLearnersCount === 0
                ? 'All learners in this grade have assessment records.'
                : `${totalLearnersCount - completedLearnersCount} learner(s) awaiting mark or rubric entry.`}
            </p>
          </div>

          {/* Action buttons: SHOW MISSING MARKS & SAVE MARKS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="toggle-missing-marks-btn"
              onClick={() => setShowMissingOnly(!showMissingOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                showMissingOnly
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showMissingOnly ? 'SHOWING MISSING ONLY' : 'FILTER MISSING'}</span>
            </button>

            <button
              id="save-marks-btn"
              onClick={handleSaveMarks}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#6b1426] hover:bg-[#540d1e] text-white flex items-center gap-2 shadow-xs transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>SAVE MARKS</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              completionPercentage === 100
                ? 'bg-emerald-600'
                : completionPercentage >= 50
                ? 'bg-[#6b1426]'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Search bar inside marks view */}
        <div className="pt-2 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search learner name or admission no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white focus:border-[#6b1426] focus:outline-none"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* MARKS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse" id="marks-table">
            <thead>
              <tr className="bg-stone-100/90 text-stone-700 text-xs font-bold border-b border-stone-200">
                <th className="py-3 px-4 w-16 text-center">ADM</th>
                <th className="py-3 px-4 min-w-[200px]">LEARNER NAME</th>
                <th className="py-3 px-4 w-36 text-center bg-rose-50/50">
                  <div className="font-extrabold text-[#6b1426]">% SCORE (/100)</div>
                  <div className="text-[10px] font-normal text-stone-500">Pure Score (0-100)</div>
                </th>
                <th className="py-3 px-4 w-36 text-center bg-sky-50/50">
                  <div className="font-extrabold text-sky-900">POINTS (/8)</div>
                  <div className="text-[10px] font-normal text-stone-500">Points 1 to 8</div>
                </th>
                <th className="py-3 px-4 w-44 text-center bg-amber-50/50">
                  <div className="font-extrabold text-amber-950">RUBRIC LEVEL</div>
                  <div className="text-[10px] font-normal text-stone-500">CBC Competency Level</div>
                </th>
                <th className="py-3 px-4 w-16 text-center">PROFILE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
              {displayedLearners.length > 0 ? (
                displayedLearners.map((learner) => {
                  const scoreStr = localScores[learner.id] ?? '';
                  const pointsVal = localPoints[learner.id] ?? null;
                  const levelVal = localLevels[learner.id] || '—';
                  const error = validationErrors[learner.id];
                  const rubricConfig = getRubricByCode(levelVal);

                  return (
                    <tr
                      key={learner.id}
                      className={`hover:bg-stone-50/80 transition ${
                        error ? 'bg-rose-50/60' : ''
                      }`}
                    >
                      {/* ADM */}
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-800 text-center">
                        {learner.admNo}
                      </td>

                      {/* LEARNER */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{learner.fullName}</div>
                        <div className="text-[11px] text-stone-500">
                          {learner.gender === 'M' ? 'Male' : 'Female'} • Att: {learner.attendanceRate}%
                        </div>
                      </td>

                      {/* INDEPENDENT SCORE (/100) INPUT */}
                      <td className="py-3.5 px-4 text-center bg-rose-50/30">
                        <div className="inline-block text-center">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              id={`score-input-${learner.admNo}`}
                              placeholder="0-100"
                              value={scoreStr}
                              onChange={(e) => handleScoreChange(learner.id, e.target.value)}
                              className={`w-28 text-center font-mono font-extrabold text-sm py-1.5 px-3 rounded-xl border focus:outline-none transition ${
                                error
                                  ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-400'
                                  : scoreStr !== ''
                                  ? 'border-rose-300 bg-white text-stone-900 focus:border-[#6b1426] focus:ring-2 focus:ring-rose-500/20'
                                  : 'border-stone-300 bg-stone-50 text-stone-900 focus:border-[#6b1426] focus:bg-white'
                              }`}
                            />
                            {scoreStr !== '' && (
                              <span className="ml-1 font-bold text-stone-500 text-xs">%</span>
                            )}
                          </div>
                          {error && (
                            <div className="text-[10px] text-rose-700 font-semibold mt-1 max-w-[150px]">
                              {error}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* INDEPENDENT POINTS (/8) INPUT & SELECT */}
                      <td className="py-3.5 px-4 text-center bg-sky-50/30">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <select
                            id={`points-select-${learner.admNo}`}
                            value={pointsVal !== null ? pointsVal : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : Number(e.target.value);
                              handlePointsChange(learner.id, val);
                            }}
                            className="font-mono font-bold text-xs py-1.5 px-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:border-sky-600 focus:outline-none"
                          >
                            <option value="">— Unset —</option>
                            <option value="8">8 pts</option>
                            <option value="7">7 pts</option>
                            <option value="6">6 pts</option>
                            <option value="5">5 pts</option>
                            <option value="4">4 pts</option>
                            <option value="3">3 pts</option>
                            <option value="2">2 pts</option>
                            <option value="1">1 pt</option>
                          </select>
                        </div>
                      </td>

                      {/* INDEPENDENT RUBRIC LEVEL SELECTOR */}
                      <td className="py-3.5 px-4 text-center bg-amber-50/30">
                        <div className="inline-flex items-center gap-2 justify-center">
                          <select
                            id={`rubric-select-${learner.admNo}`}
                            value={levelVal}
                            onChange={(e) => handleLevelChange(learner.id, e.target.value)}
                            className="font-bold text-xs py-1.5 px-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:border-amber-600 focus:outline-none"
                          >
                            <option value="—">— None —</option>
                            <option value="EE1">EE1 (Exceeding Expectation 1)</option>
                            <option value="EE2">EE2 (Exceeding Expectation 2)</option>
                            <option value="ME1">ME1 (Meeting Expectation 1)</option>
                            <option value="ME2">ME2 (Meeting Expectation 2)</option>
                            <option value="AE1">AE1 (Approaching Expectation 1)</option>
                            <option value="AE2">AE2 (Approaching Expectation 2)</option>
                            <option value="BE1">BE1 (Below Expectation 1)</option>
                            <option value="BE2">BE2 (Below Expectation 2)</option>
                          </select>

                          {levelVal !== '—' && (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${rubricConfig.colorClass}`}
                            >
                              {levelVal}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Profile Icon */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onSelectLearner(learner)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-sky-800 hover:bg-sky-100 transition"
                          title="View Learner Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 text-xs">
                    {showMissingOnly
                      ? 'No learners with missing marks found in this class.'
                      : 'No learners found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="sm:hidden divide-y divide-stone-200">
          {displayedLearners.length > 0 ? (
            displayedLearners.map((learner) => {
              const scoreStr = localScores[learner.id] ?? '';
              const pointsVal = localPoints[learner.id] ?? null;
              const levelVal = localLevels[learner.id] || '—';
              const error = validationErrors[learner.id];
              const rubricConfig = getRubricByCode(levelVal);

              return (
                <div
                  key={learner.id}
                  className={`p-4 space-y-3 ${error ? 'bg-rose-50/60' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                        ADM {learner.admNo}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-sm mt-0.5">
                        {learner.fullName}
                      </h4>
                    </div>

                    <button
                      onClick={() => onSelectLearner(learner)}
                      className="text-xs text-[#6b1426] font-semibold underline"
                    >
                      Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {/* Independent Score */}
                    <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-200">
                      <label className="block text-[10px] font-bold text-rose-950 mb-1">
                        % Score (/100):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0-100"
                        value={scoreStr}
                        onChange={(e) => handleScoreChange(learner.id, e.target.value)}
                        className={`w-full font-mono font-extrabold text-sm py-1 px-1.5 rounded-lg border text-center focus:outline-none ${
                          error
                            ? 'border-rose-500 bg-rose-50 text-rose-900'
                            : 'border-stone-300 bg-white text-stone-900 focus:border-[#6b1426]'
                        }`}
                      />
                    </div>

                    {/* Independent Points */}
                    <div className="bg-sky-50/50 p-2 rounded-xl border border-sky-200">
                      <label className="block text-[10px] font-bold text-sky-950 mb-1">
                        Points (/8):
                      </label>
                      <select
                        value={pointsVal !== null ? pointsVal : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          handlePointsChange(learner.id, val);
                        }}
                        className="w-full font-mono font-bold text-xs py-1 px-1 rounded-lg border border-stone-300 bg-white text-center"
                      >
                        <option value="">—</option>
                        <option value="8">8</option>
                        <option value="7">7</option>
                        <option value="6">6</option>
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                      </select>
                    </div>

                    {/* Independent Rubric */}
                    <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-200">
                      <label className="block text-[10px] font-bold text-amber-950 mb-1">
                        Rubric Level:
                      </label>
                      <select
                        value={levelVal}
                        onChange={(e) => handleLevelChange(learner.id, e.target.value)}
                        className="w-full font-bold text-[11px] py-1 px-1 rounded-lg border border-stone-300 bg-white text-center"
                      >
                        <option value="—">—</option>
                        <option value="EE1">EE1</option>
                        <option value="EE2">EE2</option>
                        <option value="ME1">ME1</option>
                        <option value="ME2">ME2</option>
                        <option value="AE1">AE1</option>
                        <option value="AE2">AE2</option>
                        <option value="BE1">BE1</option>
                        <option value="BE2">BE2</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-rose-700 font-semibold bg-rose-100 p-2 rounded-lg">
                      {error}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-stone-500">
              No learners found.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-16 sm:bottom-4 bg-stone-900/95 backdrop-blur-xs text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 z-30 border border-stone-800">
        <div className="text-xs text-stone-300 text-center sm:text-left">
          <span>Target: </span>
          <strong className="text-white font-bold">
            {selectedGrade} • {selectedSubject} • {selectedTerm}
          </strong>
          <span className="mx-2 text-stone-600">|</span>
          <span>
            {completedLearnersCount} of {totalLearnersCount} marked ({completionPercentage}%)
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (isDirty) {
                if (window.confirm('Discard unsaved mark changes?')) {
                  setIsDirty(false);
                }
              }
            }}
            disabled={!isDirty}
            className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white disabled:opacity-40 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveMarks}
            id="bottom-save-marks-btn"
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#6b1426] hover:bg-[#540d1e] text-white flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>SAVE MARKS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
