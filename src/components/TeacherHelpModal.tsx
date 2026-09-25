import React, { useState } from 'react';
import { X, HelpCircle, BookOpen, CheckSquare, FileText, Award, Smartphone, ShieldCheck } from 'lucide-react';
import { ASSESSMENT_LEVELS } from '../utils/grading';

interface TeacherHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'marks' | 'attendance' | 'reports' | 'levels';
}

export const TeacherHelpModal: React.FC<TeacherHelpModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'marks',
}) => {
  const [activeTab, setActiveTab] = useState<'marks' | 'attendance' | 'reports' | 'levels'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      id="teacher-help-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-700 text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Teacher Quick Help &amp; Guide</h2>
              <p className="text-xs text-stone-300">Simple instructions for your daily classroom tasks</p>
            </div>
          </div>
          <button
            id="close-help-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
            title="Close Help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('marks')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'marks'
                ? 'border-orange-700 bg-white text-orange-900 shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>How to Enter Marks</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'attendance'
                ? 'border-orange-700 bg-white text-orange-900 shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>How to Take Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'reports'
                ? 'border-orange-700 bg-white text-orange-900 shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reports &amp; Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab('levels')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'levels'
                ? 'border-orange-700 bg-white text-orange-900 shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Assessment Levels (EE, ME...)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm text-stone-700 space-y-4">
          {activeTab === 'marks' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-orange-50 border border-orange-200 p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-800 shrink-0 mt-0.5" />
                <div className="text-xs text-orange-950">
                  <strong className="block text-sm font-semibold text-orange-900 mb-0.5">5-Step Marks Workflow</strong>
                  The system automatically remembers your last selected class and subject. Marks are out of 72.
                </div>
              </div>

              <ol className="space-y-3">
                <li className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-700 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">Select Class, Subject &amp; Term</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Choose e.g. <strong>Grade 8 East</strong>, <strong>Mathematics</strong>, and <strong>Term 2</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-700 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">Type Marks (0 to 72)</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Type directly into the mark box. The system instantly calculates the <strong>Level</strong> (e.g. EE1, ME1) and <strong>Points</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-700 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">Review Completion &amp; Missing Marks</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Watch the progress bar (e.g. 15 / 17 learners completed). Click <strong>SHOW MISSING MARKS</strong> to see learners who haven&apos;t been marked yet.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-700 text-xs font-bold text-white">
                    4
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">Automatic Safety &amp; Save</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Changes are auto-saved locally. Press the orange <strong>SAVE MARKS</strong> button to lock and sync. You will see <strong>“Marks saved successfully.”</strong>
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5">
                <h4 className="text-sm font-semibold text-amber-900 mb-1">Fast Attendance Recording</h4>
                <p className="text-xs text-amber-900">
                  Instead of clicking every learner one by one, use the <strong>MARK ALL PRESENT</strong> shortcut!
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1">Step 1: Choose Class &amp; Date</h5>
                  <p className="text-xs text-stone-600">Select your assigned class and today&apos;s date (defaults to today).</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1">Step 2: One-Click Quick Fill</h5>
                  <p className="text-xs text-stone-600">
                    Tap <strong>MARK ALL PRESENT</strong>. All learners will turn green (Present).
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1">Step 3: Toggle Only Absent or Late</h5>
                  <p className="text-xs text-stone-600">
                    Simply tap <strong>Absent</strong> or <strong>Late</strong> for the few learners who are away or late.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1">Step 4: Save Attendance</h5>
                  <p className="text-xs text-stone-600">
                    Tap <strong>Save Attendance</strong>. Attendance rates update automatically in learner profiles and term reports.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-900 text-sm mb-1">Learner Profile</h4>
                <p className="text-xs text-stone-600">
                  Click on any learner in <strong>MY LEARNERS</strong> to view their photo, admission number, attendance percentage, current term performance, previous term performance, and previous year performance.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-900 text-sm mb-1">Teacher Comments with Templates</h4>
                <p className="text-xs text-stone-600">
                  Class teachers can add <strong>General Comment</strong> and <strong>Class Teacher Comment</strong>. You can click on pre-made comment templates to save typing time, or type your own remarks.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-900 text-sm mb-1">Print Centre</h4>
                <p className="text-xs text-stone-600">
                  From the Print Centre, preview and print official <strong>Report Cards</strong>, <strong>Class Mark Sheets</strong>, and <strong>Attendance Summaries</strong> with the Reberwet JSS school badge.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'levels' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">
                Kenya CBC Junior Secondary assessments are scored out of <strong>72 Marks</strong>. The portal maps marks to standard CBC descriptors:
              </p>

              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <tr>
                      <th className="p-2.5 font-bold">Code</th>
                      <th className="p-2.5 font-bold">Level Name</th>
                      <th className="p-2.5 font-bold">Mark / 72</th>
                      <th className="p-2.5 font-bold">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {ASSESSMENT_LEVELS.map((lvl) => (
                      <tr key={lvl.code} className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold">
                          <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${lvl.colorClass}`}>
                            {lvl.code}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-stone-800">{lvl.name}</td>
                        <td className="p-2.5 text-stone-700 font-mono font-semibold">
                          {lvl.minMark} – {lvl.maxMark}
                        </td>
                        <td className="p-2.5 font-bold text-stone-900">{lvl.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Important:</strong> Marks above 72 or below 0 are rejected with:
                <div className="mt-1 font-mono text-xs text-rose-800 bg-rose-50 p-1.5 rounded border border-rose-200">
                  “Invalid mark. Enter a value between 0 and 72.”
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 p-3.5 flex justify-between items-center text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-orange-700" />
            Works cleanly on both phone &amp; laptop
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-orange-800 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-900 transition"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
};
