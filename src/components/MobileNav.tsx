import React from 'react';
import { Home, BookOpen, CheckSquare, Users, MoreHorizontal } from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMoreMenu: () => void;
  pendingMarksCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onOpenMoreMenu,
  pendingMarksCount = 2,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-lg px-2 py-1.5"
    >
      <div className="grid grid-cols-5 gap-1 items-center">
        {/* Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentView === 'dashboard'
              ? 'text-[#6b1426] font-bold bg-rose-50'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Marks */}
        <button
          onClick={() => onNavigate('marks')}
          className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentView === 'marks'
              ? 'text-[#6b1426] font-bold bg-rose-50'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Marks</span>
          {pendingMarksCount > 0 && (
            <span className="absolute top-0.5 right-3 w-2 h-2 rounded-full bg-sky-600" />
          )}
        </button>

        {/* Attendance */}
        <button
          onClick={() => onNavigate('attendance')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentView === 'attendance'
              ? 'text-[#6b1426] font-bold bg-rose-50'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Attendance</span>
        </button>

        {/* Learners */}
        <button
          onClick={() => onNavigate('learners')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentView === 'learners'
              ? 'text-[#6b1426] font-bold bg-rose-50'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Learners</span>
        </button>

        {/* More */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            ['reports', 'announcements', 'documents', 'classes', 'profile', 'admin'].includes(currentView)
              ? 'text-[#6b1426] font-bold bg-rose-50'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </div>
    </nav>
  );
};
