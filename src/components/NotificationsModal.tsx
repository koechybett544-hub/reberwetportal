import React from 'react';
import { Announcement } from '../types';
import { X, Bell, CheckCircle2, Megaphone } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
  onNavigateToAnnouncements: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  announcements,
  onNavigateToAnnouncements,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="notifications-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-900 p-4 text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Notices &amp; Deadlines</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3 bg-stone-50 hover:bg-orange-50/50 rounded-xl border border-stone-200 text-xs space-y-1 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{ann.title}</span>
                <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-mono">
                  {ann.date}
                </span>
              </div>
              <p className="text-stone-600 line-clamp-2">{ann.message}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-100 p-3 bg-stone-50 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigateToAnnouncements();
            }}
            className="text-orange-800 font-bold hover:underline"
          >
            View All in Announcements →
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-200 font-semibold text-stone-700 hover:bg-stone-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
