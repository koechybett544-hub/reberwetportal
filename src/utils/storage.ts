import {
  Learner,
  MarkEntry,
  AttendanceRecord,
  Announcement,
  CalendarEvent,
  SchoolDocument,
  AuditLog,
  TeacherActivity,
  UserProfile,
} from '../types';
import {
  INITIAL_LEARNERS,
  INITIAL_MARKS,
  INITIAL_ATTENDANCE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEACHER_ACTIVITIES,
  DEFAULT_USERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'reberwet_current_user_v3',
  TEACHERS: 'reberwet_teachers_v3',
  LEARNERS: 'reberwet_learners_v3',
  MARKS: 'reberwet_marks_v3',
  ATTENDANCE: 'reberwet_attendance_v3',
  ANNOUNCEMENTS: 'reberwet_announcements_v3',
  CALENDAR: 'reberwet_calendar_v3',
  DOCUMENTS: 'reberwet_documents_v3',
  AUDIT_LOGS: 'reberwet_audit_logs_v3',
  TEACHER_ACTIVITIES: 'reberwet_teacher_activities_v3',
  LAST_SELECTION: 'reberwet_teacher_last_selection_v3',
  ONBOARDING_SEEN: 'reberwet_teacher_onboarding_seen_v3',
  FIRST_MARKS_HELP_SEEN: 'reberwet_first_marks_help_seen_v3',
};

export interface TeacherLastSelection {
  grade: string;
  stream?: string;
  subject: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
}

export const StorageService = {
  // Teachers
  getTeachers(): UserProfile[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USERS;
  },

  saveTeachers(teachers: UserProfile[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    } catch {
      // ignore
    }
  },

  // Current user
  getCurrentUser(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const all = this.getTeachers();
    return all[0] || DEFAULT_USERS[0];
  },

  setCurrentUser(user: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  // Last selection for marks
  getLastSelection(): TeacherLastSelection {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_SELECTION);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      grade: 'Grade 8',
      stream: '',
      subject: 'Mathematics',
      term: 'Term 3',
      academicYear: '2026',
    };
  },

  saveLastSelection(selection: TeacherLastSelection) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SELECTION, JSON.stringify(selection));
    } catch {
      // ignore
    }
  },

  // Learners
  getLearners(): Learner[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEARNERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_LEARNERS;
  },

  saveLearners(learners: Learner[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNERS, JSON.stringify(learners));
    } catch {
      // ignore
    }
  },

  // Marks
  getMarks(): MarkEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MARKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_MARKS;
  },

  saveMarks(marks: MarkEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));
    } catch {
      // ignore
    }
  },

  // Attendance
  getAttendance(): AttendanceRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ATTENDANCE;
  },

  saveAttendance(attendance: AttendanceRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    } catch {
      // ignore
    }
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ANNOUNCEMENTS;
  },

  saveAnnouncements(announcements: Announcement[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch {
      // ignore
    }
  },

  // Calendar
  getCalendar(): CalendarEvent[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CALENDAR_EVENTS;
  },

  saveCalendar(events: CalendarEvent[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
    } catch {
      // ignore
    }
  },

  // Documents
  getDocuments(): SchoolDocument[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DOCUMENTS;
  },

  saveDocuments(docs: SchoolDocument[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch {
      // ignore
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'date' | 'time'>): AuditLog[] {
    const current = this.getAuditLogs();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      date,
      time,
      ...entry,
    };
    const updated = [newLog, ...current];
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  // Teacher activities
  getTeacherActivities(): TeacherActivity[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_ACTIVITIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TEACHER_ACTIVITIES;
  },

  addTeacherActivity(action: string, category: TeacherActivity['category']) {
    const current = this.getTeacherActivities();
    const newAct: TeacherActivity = {
      id: `act-${Date.now()}`,
      action,
      time: 'Just now',
      category,
    };
    const updated = [newAct, ...current.slice(0, 7)];
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  // Onboarding status
  hasSeenOnboarding(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_SEEN) === 'true';
  },

  setOnboardingSeen() {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_SEEN, 'true');
  },

  // First marks help banner status
  hasSeenFirstMarksHelp(): boolean {
    return localStorage.getItem(STORAGE_KEYS.FIRST_MARKS_HELP_SEEN) === 'true';
  },

  setFirstMarksHelpSeen() {
    localStorage.setItem(STORAGE_KEYS.FIRST_MARKS_HELP_SEEN, 'true');
  },

  // Convenience Aliases & Helpers
  getEvents(): CalendarEvent[] {
    return this.getCalendar();
  },

  getActivities(): TeacherActivity[] {
    return this.getTeacherActivities();
  },

  addActivity(activity: TeacherActivity) {
    const current = this.getTeacherActivities();
    const updated = [activity, ...current.slice(0, 9)];
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  saveAttendanceRecord(record: AttendanceRecord) {
    const current = this.getAttendance();
    const index = current.findIndex(
      (r) => r.grade === record.grade && r.stream === record.stream && r.date === record.date
    );
    let updated: AttendanceRecord[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = record;
    } else {
      updated = [record, ...current];
    }
    this.saveAttendance(updated);
  },

  saveLearner(learner: Learner) {
    const current = this.getLearners();
    const index = current.findIndex((l) => l.id === learner.id);
    let updated: Learner[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = learner;
    } else {
      updated = [...current, learner];
    }
    this.saveLearners(updated);
  },

  updateLearner(learner: Learner) {
    this.saveLearner(learner);
  },

  updateLearnerComments(learnerId: string, generalComment: string, classTeacherComment: string) {
    const current = this.getLearners();
    const updated = current.map((l) => {
      if (l.id === learnerId) {
        return {
          ...l,
          comments: {
            generalComment,
            classTeacherComment,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return l;
    });
    this.saveLearners(updated);
  },

  addAnnouncement(ann: Announcement) {
    const current = this.getAnnouncements();
    const updated = [ann, ...current];
    this.saveAnnouncements(updated);
  },

  addDocument(doc: SchoolDocument) {
    const current = this.getDocuments();
    const updated = [doc, ...current];
    this.saveDocuments(updated);
  },

  saveCurrentUser(user: UserProfile) {
    this.setCurrentUser(user);
  },

  // Reset to default data
  resetAll() {
    localStorage.clear();
  },
};
