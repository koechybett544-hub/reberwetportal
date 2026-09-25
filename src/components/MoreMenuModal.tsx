import React from 'react';
import {
  X,
  Megaphone,
  FolderOpen,
  Printer,
  Calendar,
  ShieldCheck,
  User,
  GraduationCap,
  LogIn,
} from 'lucide-react';
import { UserProfile } from '../types';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserProfile;
  onOpenAuthModal?: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentUser,
  onOpenAuthModal,
}) => {
  if (!isOpen) return null;

  const handleSelect = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div
      id="more-menu-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h3 className="font-extrabold text-stone-900 text-sm">More Portal Modules</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {onOpenAuthModal && (
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#6b1426] text-white font-bold transition hover:bg-[#520e1c] shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign Up / Log In (Create Account)</span>
            </button>
          )}

          <button
            onClick={() => handleSelect('classes')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 text-stone-800 hover:text-orange-950 font-bold transition"
          >
            <GraduationCap className="w-5 h-5 text-orange-700 mb-1" />
            <span>My Classes</span>
          </button>

          <button
            onClick={() => handleSelect('reports')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 text-stone-800 hover:text-orange-950 font-bold transition"
          >
            <Printer className="w-5 h-5 text-orange-700 mb-1" />
            <span>Print Centre</span>
          </button>

          <button
            onClick={() => handleSelect('announcements')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 text-stone-800 hover:text-orange-950 font-bold transition"
          >
            <Megaphone className="w-5 h-5 text-orange-700 mb-1" />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => handleSelect('calendar')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 text-stone-800 hover:text-orange-950 font-bold transition"
          >
            <Calendar className="w-5 h-5 text-orange-700 mb-1" />
            <span>School Calendar</span>
          </button>

          <button
            onClick={() => handleSelect('documents')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 text-stone-800 hover:text-orange-950 font-bold transition"
          >
            <FolderOpen className="w-5 h-5 text-orange-700 mb-1" />
            <span>Documents</span>
          </button>

          <button
            onClick={() => handleSelect('profile')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 text-stone-800 hover:text-orange-950 font-bold transition"
          >
            <User className="w-5 h-5 text-orange-700 mb-1" />
            <span>My Profile</span>
          </button>

          {currentUser.role !== 'teacher' && (
            <button
              onClick={() => handleSelect('admin')}
              className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-950 font-bold transition"
            >
              <ShieldCheck className="w-5 h-5 text-orange-800" />
              <span>Admin &amp; Audit Trail</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
