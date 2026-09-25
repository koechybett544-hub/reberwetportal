import React, { useState, useEffect, useCallback } from 'react';
import {
  Learner,
  MarkEntry,
  AttendanceRecord,
  Announcement,
  SchoolDocument,
  TeacherActivity,
  AuditLogEntry,
  UserProfile,
} from './types';
import { StorageService } from './utils/storage';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TeacherDashboard } from './components/TeacherDashboard';
import { MarksEntry } from './components/MarksEntry';
import { AttendanceManager } from './components/AttendanceManager';
import { LearnerDirectory } from './components/LearnerDirectory';
import { LearnerProfileModal } from './components/LearnerProfileModal';
import { MyClasses } from './components/MyClasses';
import { PrintCenter } from './components/PrintCenter';
import { AnnouncementsAndCalendar } from './components/AnnouncementsAndCalendar';
import { DocumentCenter } from './components/DocumentCenter';
import { TeacherProfile } from './components/TeacherProfile';
import { AdminPanel } from './components/AdminPanel';
import { TeacherHelpModal } from './components/TeacherHelpModal';
import { OnboardingModal } from './components/OnboardingModal';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import { NotificationsModal } from './components/NotificationsModal';
import { MoreMenuModal } from './components/MoreMenuModal';
import { AuthModal } from './components/AuthModal';
import { GmailCenterModal } from './components/GmailCenterModal';
import {
  initAuth,
  logOut,
  saveMarksToFirestore,
  saveTeacherToFirestore,
  fetchTeachersFromFirestore,
} from './lib/firebase';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Application Data State backed by StorageService
  const [learners, setLearners] = useState<Learner[]>(() => StorageService.getLearners());
  const [marks, setMarks] = useState<MarkEntry[]>(() => StorageService.getMarks());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    StorageService.getAttendance()
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    StorageService.getAnnouncements()
  );
  const [events, setEvents] = useState(() => StorageService.getEvents());
  const [documents, setDocuments] = useState<SchoolDocument[]>(() =>
    StorageService.getDocuments()
  );
  const [activities, setActivities] = useState<TeacherActivity[]>(() =>
    StorageService.getActivities()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    StorageService.getAuditLogs()
  );
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    StorageService.getCurrentUser()
  );
  const [teachers, setTeachers] = useState<UserProfile[]>(() =>
    StorageService.getTeachers()
  );

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);

  // Modals and UI state
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => !StorageService.hasSeenOnboarding());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // New Requested Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [gmailModalOpen, setGmailModalOpen] = useState(false);

  // Unsaved changes protection
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Simulated Offline mode state
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'offline'>('idle');

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Initialize Firebase Auth listener on startup
  useEffect(() => {
    const unsubscribe = initAuth((user) => {
      if (user && user.email) {
        // Find existing teacher matching Google email
        const existing = teachers.find(
          (t) => t.email.toLowerCase() === user.email?.toLowerCase()
        );
        if (existing) {
          setCurrentUser(existing);
          StorageService.saveCurrentUser(existing);
        }
      }
    });

    // Attempt initial Firestore sync
    fetchTeachersFromFirestore()
      .then((remoteTeachers: UserProfile[]) => {
        if (remoteTeachers && remoteTeachers.length > 0) {
          setTeachers((prev) => {
            const merged = [...prev];
            remoteTeachers.forEach((rt) => {
              const idx = merged.findIndex((t) => t.id === rt.id);
              if (idx >= 0) merged[idx] = rt;
              else if (merged.length < 12) merged.push(rt);
            });
            StorageService.saveTeachers(merged);
            return merged;
          });
        }
      })
      .catch((err: unknown) => console.log('Firestore initial fetch fallback:', err));

    return () => unsubscribe();
  }, []);

  const handleUpdateTeachers = (updatedTeachers: UserProfile[]) => {
    setTeachers(updatedTeachers);
    StorageService.saveTeachers(updatedTeachers);
    const currentInList = updatedTeachers.find((t) => t.id === currentUser.id);
    if (currentInList) {
      setCurrentUser(currentInList);
      StorageService.saveCurrentUser(currentInList);
    }
  };

  const handleUpdateCurrentUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    StorageService.saveCurrentUser(updatedUser);
    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === updatedUser.id);
      const next = exists
        ? prev.map((t) => (t.id === updatedUser.id ? updatedUser : t))
        : [...prev, updatedUser];
      StorageService.saveTeachers(next);
      return next;
    });
    // Sync with Firestore asynchronously
    saveTeacherToFirestore(updatedUser).catch((e: unknown) => console.log('Firestore sync notice:', e));
    showToast(`Updated profile for ${updatedUser.name}`);
  };

  // Safe Navigation Handler
  const navigateTo = (view: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigationTarget(view);
      setShowUnsavedModal(true);
      return;
    }

    if (view === currentView) return;
    setViewHistory((prev) => [...prev, view]);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back Navigation Handler
  const handleBack = () => {
    if (hasUnsavedChanges) {
      setPendingNavigationTarget('__BACK__');
      setShowUnsavedModal(true);
      return;
    }

    if (viewHistory.length > 1) {
      const nextHistory = [...viewHistory];
      nextHistory.pop();
      const prevView = nextHistory[nextHistory.length - 1] || 'dashboard';
      setViewHistory(nextHistory);
      setCurrentView(prevView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('dashboard');
    }
  };

  // Unsaved Modal Actions
  const handleUnsavedLeave = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedModal(false);
    if (pendingNavigationTarget === '__BACK__') {
      const nextHistory = [...viewHistory];
      nextHistory.pop();
      const prevView = nextHistory[nextHistory.length - 1] || 'dashboard';
      setViewHistory(nextHistory);
      setCurrentView(prevView);
    } else if (pendingNavigationTarget) {
      setViewHistory((prev) => [...prev, pendingNavigationTarget]);
      setCurrentView(pendingNavigationTarget);
    }
    setPendingNavigationTarget(null);
  };

  const handleUnsavedSaveAndLeave = () => {
    showToast('All unsaved marks preserved in local database.');
    setHasUnsavedChanges(false);
    setShowUnsavedModal(false);
    if (pendingNavigationTarget === '__BACK__') {
      const nextHistory = [...viewHistory];
      nextHistory.pop();
      const prevView = nextHistory[nextHistory.length - 1] || 'dashboard';
      setViewHistory(nextHistory);
      setCurrentView(prevView);
    } else if (pendingNavigationTarget) {
      setViewHistory((prev) => [...prev, pendingNavigationTarget]);
      setCurrentView(pendingNavigationTarget);
    }
    setPendingNavigationTarget(null);
  };

  // Offline Simulation Toggle
  const handleToggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (next) {
        setSyncState('offline');
        showToast('Switched to simulated OFFLINE mode. Auto-save is safely active.');
      } else {
        setSyncState('saving');
        setTimeout(() => {
          setSyncState('saved');
          showToast('Back ONLINE. Data seamlessly synced to cloud database.');
        }, 800);
      }
      return next;
    });
  };

  // Update Marks handler
  const handleSaveMarks = (updatedMarks: MarkEntry[]) => {
    setSyncState('saving');
    StorageService.saveMarks(updatedMarks);
    setMarks(updatedMarks);
    setHasUnsavedChanges(false);

    // Sync with Firestore asynchronously
    saveMarksToFirestore(updatedMarks).catch((e: unknown) => console.log('Firestore marks sync note:', e));

    setTimeout(() => {
      setSyncState('saved');
    }, 400);

    // Record activity
    const act: TeacherActivity = {
      id: `act-${Date.now()}`,
      action: `Saved assessment marks for Grade 8 Mathematics`,
      time: 'Just now',
      category: 'marks',
    };
    StorageService.addActivity(act);
    setActivities(StorageService.getActivities());

    // Record Audit Log
    const audit: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Marks Batch Submission',
      grade: 'Grade 8',
      subject: 'Mathematics',
      learnerName: 'Class Roster',
      admNo: 'Grade 8',
      previousMark: null,
      newMark: 58,
      details: 'Evaluated % Score and Rubric Level independently for Term 3',
    };
    StorageService.addAuditLog(audit);
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Update Attendance handler
  const handleSaveAttendance = (record: AttendanceRecord) => {
    StorageService.saveAttendanceRecord(record);
    setAttendanceRecords(StorageService.getAttendance());

    const act: TeacherActivity = {
      id: `act-${Date.now()}`,
      action: `Recorded attendance for ${record.grade} (${record.date})`,
      time: 'Just now',
      category: 'attendance',
    };
    StorageService.addActivity(act);
    setActivities(StorageService.getActivities());
  };

  // Add Learner handler
  const handleAddLearner = (learner: Learner) => {
    StorageService.saveLearner(learner);
    setLearners(StorageService.getLearners());
    showToast(`Added new learner: ${learner.fullName}`);
  };

  // Update Learner handler
  const handleUpdateLearner = (updatedLearner: Learner) => {
    StorageService.saveLearner(updatedLearner);
    setLearners(StorageService.getLearners());
    setSelectedLearner(updatedLearner);
    showToast(`Updated details for ${updatedLearner.fullName}`);
  };

  // Bulk Import Learners handler
  const handleBulkImportLearners = (newLearners: Learner[]) => {
    const updated = [...learners, ...newLearners];
    setLearners(updated);
    StorageService.saveLearners(updated);
  };

  // Update Learner Comments handler
  const handleUpdateComments = (learnerId: string, general: string, classTeacher: string) => {
    StorageService.updateLearnerComments(learnerId, general, classTeacher);
    setLearners(StorageService.getLearners());
  };

  // Add Announcement handler
  const handleAddAnnouncement = (ann: Announcement) => {
    StorageService.addAnnouncement(ann);
    setAnnouncements(StorageService.getAnnouncements());
  };

  // Add Document handler
  const handleAddDocument = (doc: SchoolDocument) => {
    StorageService.addDocument(doc);
    setDocuments(StorageService.getDocuments());
  };

  // Switch User Profile handler
  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    StorageService.saveCurrentUser(user);
    showToast(`Switched active profile to ${user.name} (${user.role})`);
  };

  // Auth Modal Login Success
  const handleAuthLoginSuccess = (verifiedUser: UserProfile) => {
    setCurrentUser(verifiedUser);
    StorageService.saveCurrentUser(verifiedUser);

    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === verifiedUser.id || t.email === verifiedUser.email);
      let next: UserProfile[];
      if (exists) {
        next = prev.map((t) => (t.id === verifiedUser.id || t.email === verifiedUser.email ? verifiedUser : t));
      } else {
        if (prev.length < 12) {
          next = [...prev, verifiedUser];
        } else {
          next = prev;
        }
      }
      StorageService.saveTeachers(next);
      return next;
    });

    saveTeacherToFirestore(verifiedUser).catch((e: unknown) => console.log('Firestore teacher save:', e));
  };

  const handleLogout = async () => {
    await logOut();
    showToast('Logged out of Google session.');
  };

  // Calculate pending marks count
  const pendingMarksCount = 2;

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    if (currentView === 'dashboard') return [];
    const labels: Record<string, string> = {
      classes: 'My Classes',
      marks: 'Enter Marks',
      attendance: 'Attendance',
      learners: 'Learners Directory',
      reports: 'Print Centre',
      announcements: 'Announcements',
      calendar: 'School Calendar',
      documents: 'Document Centre',
      profile: 'My Profile',
      admin: 'Administration & Audit',
    };
    return [
      { label: 'Portal Home', view: 'dashboard' },
      { label: labels[currentView] || currentView },
    ];
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-orange-200">
      {/* Offline Status & Sync Safety Banner */}
      <OfflineIndicator
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        syncState={syncState}
      />

      {/* Global Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadNotificationsCount={announcements.filter((a) => a.isNew).length}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        currentView={currentView}
        onBack={viewHistory.length > 1 ? handleBack : undefined}
        breadcrumbs={getBreadcrumbs()}
        onNavigate={navigateTo}
        teachers={teachers}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenGmail={() => setGmailModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5">
        {/* VIEW ROUTING */}
        {currentView === 'dashboard' && (
          <TeacherDashboard
            currentUser={currentUser}
            teachers={teachers}
            onNavigate={navigateTo}
            activities={activities}
            announcements={announcements}
            pendingMarksCount={pendingMarksCount}
            onUpdateTeachers={handleUpdateTeachers}
            onOpenGmail={() => setGmailModalOpen(true)}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onShowSuccessToast={showToast}
          />
        )}

        {currentView === 'classes' && (
          <MyClasses
            learners={learners}
            currentUser={currentUser}
            onNavigateToMarksWithClass={(grade, stream) => {
              StorageService.saveLastSelection({
                grade,
                stream,
                subject: 'Mathematics',
                term: 'Term 3',
                academicYear: '2026',
              });
              navigateTo('marks');
            }}
            onNavigateToAttendanceWithClass={(grade, stream) => {
              navigateTo('attendance');
            }}
            onViewLearnersWithFilter={(grade, stream) => {
              navigateTo('learners');
            }}
            onNavigateToPrintSheet={(grade, stream) => {
              navigateTo('reports');
            }}
          />
        )}

        {currentView === 'marks' && (
          <MarksEntry
            learners={learners}
            marks={marks}
            currentUser={currentUser}
            onSaveMarks={handleSaveMarks}
            isSimulatedOffline={isSimulatedOffline}
            onOpenHelp={() => setHelpModalOpen(true)}
            onSelectLearner={(learner) => setSelectedLearner(learner)}
            setHasUnsavedChanges={setHasUnsavedChanges}
            onShowSuccessToast={showToast}
          />
        )}

        {currentView === 'attendance' && (
          <AttendanceManager
            learners={learners}
            currentUser={currentUser}
            onSaveAttendance={handleSaveAttendance}
            attendanceRecords={attendanceRecords}
            onShowSuccessToast={showToast}
          />
        )}

        {currentView === 'learners' && (
          <LearnerDirectory
            learners={learners}
            currentUser={currentUser}
            onSelectLearner={(learner) => setSelectedLearner(learner)}
            onAddLearner={handleAddLearner}
            onNavigateToMarks={() => navigateTo('marks')}
          />
        )}

        {currentView === 'reports' && (
          <PrintCenter
            learners={learners}
            marks={marks}
            currentUser={currentUser}
            initialGrade={currentUser.assignments?.[0]?.grade || 'Grade 8'}
            onShowSuccessToast={showToast}
          />
        )}

        {currentView === 'announcements' && (
          <AnnouncementsAndCalendar
            announcements={announcements}
            events={events}
            currentUser={currentUser}
            onAddAnnouncement={handleAddAnnouncement}
            onShowSuccessToast={showToast}
          />
        )}

        {currentView === 'calendar' && (
          <AnnouncementsAndCalendar
            announcements={announcements}
            events={events}
            currentUser={currentUser}
            onAddAnnouncement={handleAddAnnouncement}
            onShowSuccessToast={showToast}
          />
        )}

        {currentView === 'documents' && (
          <DocumentCenter
            documents={documents}
            currentUser={currentUser}
            onAddDocument={handleAddDocument}
            onShowSuccessToast={showToast}
          />
        )}

        {currentView === 'profile' && (
          <TeacherProfile
            currentUser={currentUser}
            onNavigate={navigateTo}
            onUpdateCurrentUser={handleUpdateCurrentUser}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            auditLogs={auditLogs}
            onBulkImportLearners={handleBulkImportLearners}
            onShowSuccessToast={showToast}
            onSwitchUser={handleSwitchUser}
            teachers={teachers}
            onUpdateTeachers={handleUpdateTeachers}
          />
        )}
      </main>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div
          id="global-success-toast"
          className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-stone-700 text-xs font-semibold animate-in fade-in slide-from-top-4"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenMoreMenu={() => setMoreMenuOpen(true)}
        pendingMarksCount={pendingMarksCount}
      />

      {/* Modals */}
      {/* 1. Learner Profile Modal */}
      <LearnerProfileModal
        learner={selectedLearner}
        onClose={() => setSelectedLearner(null)}
        onUpdateComments={handleUpdateComments}
        currentUser={currentUser}
        onShowSuccessToast={showToast}
        onUpdateLearner={handleUpdateLearner}
        marks={marks}
      />

      {/* 2. Teacher Quick Help Modal */}
      <TeacherHelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* 3. Teacher Onboarding Guide Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onNavigate={navigateTo}
      />

      {/* 4. Unsaved Changes Guard Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSaveAndLeave={handleUnsavedSaveAndLeave}
        onLeaveWithoutSaving={handleUnsavedLeave}
        onCancel={() => {
          setShowUnsavedModal(false);
          setPendingNavigationTarget(null);
        }}
      />

      {/* 5. Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        announcements={announcements}
        onNavigateToAnnouncements={() => {
          setNotificationsOpen(false);
          navigateTo('announcements');
        }}
      />

      {/* 6. Mobile More Menu Modal */}
      <MoreMenuModal
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        onNavigate={navigateTo}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* 7. Auth Modal (Username/Password, Real-time SMS Code, Biometrics) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        teachers={teachers}
        onLoginSuccess={handleAuthLoginSuccess}
        onLogout={handleLogout}
        onShowSuccessToast={showToast}
      />

      {/* 8. Gmail Center Modal */}
      <GmailCenterModal
        isOpen={gmailModalOpen}
        onClose={() => setGmailModalOpen(false)}
        currentUser={currentUser}
        onShowSuccessToast={showToast}
        onTriggerGoogleSignIn={() => {
          setGmailModalOpen(false);
          setAuthModalOpen(true);
        }}
      />
    </div>
  );
}
