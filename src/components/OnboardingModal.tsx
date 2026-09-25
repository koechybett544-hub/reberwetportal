import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, BookOpen, Users, Calendar, Megaphone, Award } from 'lucide-react';
import { StorageService } from '../utils/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const STEPS = [
  {
    title: '1. View Your Classes',
    desc: 'Quickly see all your assigned streams (e.g. Grade 8 East, West) and subject allocations in one clear place.',
    icon: Users,
    view: 'classes',
  },
  {
    title: '2. Enter Marks Out of 72',
    desc: 'Select Class, Subject, and Term. Type marks to see instant CBC Levels (EE1, ME1) and points with auto-save.',
    icon: BookOpen,
    view: 'marks',
  },
  {
    title: '3. Record Daily Attendance',
    desc: 'Use the 1-click “MARK ALL PRESENT” button, then adjust only absent or late learners in seconds.',
    icon: Calendar,
    view: 'attendance',
  },
  {
    title: '4. View Learner Reports & Progress',
    desc: 'Check current-term, previous-term, and previous-year performance without complicated menus or rankings.',
    icon: Award,
    view: 'learners',
  },
  {
    title: '5. Check School Announcements',
    desc: 'Stay informed on marks submission deadlines, staff meetings, and administrative notices right from your dashboard.',
    icon: Megaphone,
    view: 'announcements',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const handleFinish = () => {
    StorageService.setOnboardingSeen();
    onClose();
  };

  const handleSkip = () => {
    StorageService.setOnboardingSeen();
    onClose();
  };

  const handleStepAction = (view: string) => {
    StorageService.setOnboardingSeen();
    onClose();
    onNavigate(view);
  };

  const step = STEPS[currentStepIndex];
  const StepIcon = step.icon;

  return (
    <div
      id="onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-stone-900 px-5 py-4 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">
              Reberwet JSS Teacher Guide
            </span>
            <h3 className="text-base font-bold text-white">Welcome to Your Portal</h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-stone-400 hover:text-white px-2 py-1 rounded hover:bg-stone-800 transition"
          >
            Skip Guide
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex bg-stone-100 px-5 py-2 gap-1.5 border-b border-stone-200">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i === currentStepIndex
                  ? 'bg-orange-700'
                  : i < currentStepIndex
                  ? 'bg-stone-400'
                  : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-800">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-stone-500">Step {currentStepIndex + 1} of {STEPS.length}</span>
              <h4 className="text-lg font-bold text-stone-900">{step.title}</h4>
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed min-h-[50px]">{step.desc}</p>

          <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => handleStepAction(step.view)}
              className="text-xs font-semibold text-orange-800 hover:text-orange-950 underline underline-offset-4"
            >
              Go to this section now →
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {currentStepIndex > 0 && (
                <button
                  onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition"
                >
                  Back
                </button>
              )}

              {currentStepIndex < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-orange-800 text-white rounded-lg hover:bg-orange-900 transition"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-orange-800 text-white rounded-lg hover:bg-orange-900 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Start Teaching</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
