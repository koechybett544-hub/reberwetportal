import React, { useState } from 'react';
import { Announcement, SchoolEvent, UserProfile } from '../types';
import { DateService } from '../utils/dateService';
import {
  Megaphone,
  Calendar,
  Clock,
  Pin,
  AlertTriangle,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AnnouncementsAndCalendarProps {
  announcements: Announcement[];
  events: SchoolEvent[];
  currentUser: UserProfile;
  onAddAnnouncement: (announcement: Announcement) => void;
  onShowSuccessToast: (msg: string) => void;
}

export const AnnouncementsAndCalendar: React.FC<AnnouncementsAndCalendarProps> = ({
  announcements,
  events,
  currentUser,
  onAddAnnouncement,
  onShowSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'calendar'>('announcements');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New announcement form state
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<'Deadlines' | 'Staff Meeting' | 'School Events' | 'Administrative'>('Deadlines');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const filteredAnnouncements = announcements.filter((a) => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const created: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      message: newMessage.trim(),
      category: newCategory,
      date: DateService.getCurrentDateISO(),
      author: currentUser.name,
      priority: newPriority,
      isNew: true,
    };

    onAddAnnouncement(created);
    setShowAddModal(false);
    setNewTitle('');
    setNewMessage('');
    onShowSuccessToast('Announcement posted to school portal.');
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-orange-700" />
            <span>Notices &amp; Academic Calendar</span>
          </h1>
          <p className="text-xs text-stone-600">
            Official Reberwet JSS communications, deadlines, and term calendar events.
          </p>
        </div>

        {/* Tab Switcher & Post Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'announcements'
                  ? 'bg-white text-orange-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Announcements</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-white text-orange-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Term Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-orange-800 hover:bg-orange-900 text-white px-3 py-2 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ANNOUNCEMENTS (Requirement 18) */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(['all', 'Deadlines', 'Staff Meeting', 'Administrative', 'School Events'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-orange-800 text-white'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {cat === 'all' ? 'All Notices' : cat}
                </button>
              )
            )}
          </div>

          {/* Announcements list */}
          <div className="space-y-3">
            {filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border transition space-y-2.5 ${
                  ann.priority === 'high'
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {ann.priority === 'high' && (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    )}
                    <h3 className="font-extrabold text-stone-900 text-base">{ann.title}</h3>
                    {ann.isNew && (
                      <span className="text-[10px] font-bold bg-orange-700 text-white px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium border border-stone-200">
                      {ann.category}
                    </span>
                    <span className="text-stone-500 font-mono">{ann.date}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{ann.message}</p>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  <span>
                    Posted by: <strong className="text-stone-700">{ann.author}</strong>
                  </span>
                  <span>Official Memo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SCHOOL CALENDAR (Requirement 19) */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs text-orange-950 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-orange-800 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-orange-900">Academic Year 2026 Schedule</strong>
              Term 2: May 5, 2026 – October 23, 2026. Keep track of crucial assessment deadlines, sports events, and mid-term breaks.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
            {events.map((evt) => {
              const eventDateStr = evt.date || evt.startDate || DateService.getCurrentDateISO();
              const dateObj = new Date(eventDateStr);
              const monthStr = dateObj.toLocaleString('default', { month: 'short' });
              const dayStr = eventDateStr.includes('-') ? eventDateStr.split('-')[2] : '01';

              return (
                <div key={evt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center rounded-xl bg-orange-100 text-orange-900 p-2 min-w-[58px] border border-orange-200 text-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {monthStr}
                      </span>
                      <span className="text-lg font-black leading-none mt-0.5">
                        {dayStr}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-stone-900">{evt.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-stone-50 text-stone-700">
                          {evt.type || evt.category || 'Event'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{evt.description}</p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-stone-500 shrink-0 sm:self-center">
                    <span className="font-mono font-medium">{eventDateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-700" />
                <span>Post School Announcement</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Science Laboratory Inventory Check"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 focus:border-orange-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-800"
                  >
                    <option value="Deadlines">Deadlines</option>
                    <option value="Staff Meeting">Staff Meeting</option>
                    <option value="Administrative">Administrative</option>
                    <option value="School Events">School Events</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-800"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Standard Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  placeholder="Type clear notice details for teachers and staff..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 focus:border-orange-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-800 hover:bg-orange-900 text-white font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
