import React, { useState, useMemo } from 'react';
import { AuditLogEntry, UserProfile, Learner, UserRole } from '../types';
import { DEFAULT_USERS, SCHOOL_INFO, GRADES, SUBJECTS } from '../data/initialData';
import { StorageService } from '../utils/storage';
import {
  ShieldCheck,
  Upload,
  History,
  Users,
  Settings,
  CheckCircle2,
  AlertCircle,
  Download,
  Lock,
  Unlock,
  Stamp,
  UserCheck,
  Search,
  Filter,
  FileSpreadsheet,
  Building2,
  Calendar,
  UserPlus,
  Edit3,
  BookOpen,
  GraduationCap,
  Briefcase,
  X,
  Plus,
  Trash2,
  Save,
  Check,
  Mail,
  Phone,
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: UserProfile;
  auditLogs: AuditLogEntry[];
  onBulkImportLearners: (learners: Learner[]) => void;
  onShowSuccessToast: (msg: string) => void;
  onSwitchUser?: (user: UserProfile) => void;
  teachers?: UserProfile[];
  onUpdateTeachers?: (teachers: UserProfile[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  auditLogs,
  onBulkImportLearners,
  onShowSuccessToast,
  onSwitchUser,
  teachers,
  onUpdateTeachers,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'import' | 'users' | 'system'>('audit');
  const isBrianBett = currentUser.role === 'super_admin' || currentUser.name.toLowerCase().includes('brian');

  // Audit Trail Filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditGradeFilter, setAuditGradeFilter] = useState('all');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  // Bulk Import State (Grade 7, Grade 8, Grade 9)
  const [csvText, setCsvText] = useState(
    `ADM,FIRST_NAME,LAST_NAME,GRADE,GENDER\n1019,Victor,Kipkemoi,Grade 8,M\n1020,Sharon,Jepchumba,Grade 8,F\n1021,Brian,Cheruiyot,Grade 7,M\n1022,Mercy,Chepkorir,Grade 9,F`
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Grade Marks Lock State (Super Admin & School Admin)
  const [lockedGrades, setLockedGrades] = useState<Record<string, boolean>>({
    'Grade 7': false,
    'Grade 8': false,
    'Grade 9': false,
  });

  // User / Staff Accounts State
  const [staffUsers, setStaffUsers] = useState<UserProfile[]>(() => {
    if (teachers && teachers.length > 0) return teachers;
    return StorageService.getTeachers();
  });

  // Staff Search & Filter State
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  const [staffGradeFilter, setStaffGradeFilter] = useState('all');

  // Modals for Staff Management
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);

  // New Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherDesignation, setNewTeacherDesignation] = useState('Junior Secondary Teacher');
  const [newTeacherRole, setNewTeacherRole] = useState<UserRole>('teacher');
  const [newTeacherTsc, setNewTeacherTsc] = useState('');
  const [newTeacherQualifications, setNewTeacherQualifications] = useState('');
  const [newTeacherSpecialization, setNewTeacherSpecialization] = useState('');
  const [newTeacherBio, setNewTeacherBio] = useState('');
  const [newTeacherAssignments, setNewTeacherAssignments] = useState<
    { subject: string; grade: string }[]
  >([{ subject: 'Mathematics', grade: 'Grade 7' }]);

  // Check privileges
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isSchoolAdmin = currentUser.role === 'school_admin' || isSuperAdmin;

  // Sync staff users helper
  const syncStaffUsers = (updated: UserProfile[]) => {
    setStaffUsers(updated);
    StorageService.saveTeachers(updated);
    if (onUpdateTeachers) {
      onUpdateTeachers(updated);
    }
  };

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditGradeFilter !== 'all' && log.grade !== auditGradeFilter) {
        return false;
      }
      if (auditActionFilter !== 'all' && !log.action.toLowerCase().includes(auditActionFilter.toLowerCase())) {
        return false;
      }
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase().trim();
        const matchesUser = log.userName?.toLowerCase().includes(q);
        const matchesLearner = log.learnerName?.toLowerCase().includes(q);
        const matchesAdm = log.admNo?.toLowerCase().includes(q);
        const matchesSubject = log.subject?.toLowerCase().includes(q);
        if (!matchesUser && !matchesLearner && !matchesAdm && !matchesSubject) return false;
      }
      return true;
    });
  }, [auditLogs, auditGradeFilter, auditActionFilter, auditSearch]);

  // Filtered Staff Users
  const filteredStaffUsers = useMemo(() => {
    return staffUsers.filter((u) => {
      if (staffRoleFilter !== 'all' && u.role !== staffRoleFilter) {
        return false;
      }
      if (staffGradeFilter !== 'all') {
        const hasGrade = u.assignments.some((a) => a.grade === staffGradeFilter);
        if (!hasGrade) return false;
      }
      if (staffSearch.trim()) {
        const q = staffSearch.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesTsc = u.tscNumber?.toLowerCase().includes(q);
        const matchesSubject = u.assignments.some((a) => a.subject.toLowerCase().includes(q));
        const matchesSpec = u.specialization?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesTsc && !matchesSubject && !matchesSpec) return false;
      }
      return true;
    });
  }, [staffUsers, staffRoleFilter, staffGradeFilter, staffSearch]);

  // Export Audit Trail to CSV
  const handleExportAuditCSV = () => {
    const headers = ['TIMESTAMP', 'TEACHER', 'ROLE', 'LEARNER', 'ADM_NO', 'GRADE', 'SUBJECT', 'PREVIOUS_MARK', 'NEW_MARK', 'ACTION', 'DETAILS'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp || ''}"`,
      `"${l.userName || ''}"`,
      `"${l.userRole || ''}"`,
      `"${l.learnerName || ''}"`,
      `"${l.admNo || ''}"`,
      `"${l.grade || ''}"`,
      `"${l.subject || ''}"`,
      `"${l.previousMark !== null && l.previousMark !== undefined ? `${l.previousMark}/72` : 'N/A'}"`,
      `"${l.newMark !== null && l.newMark !== undefined ? `${l.newMark}/72` : 'N/A'}"`,
      `"${l.action || ''}"`,
      `"${l.details || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reberwet_JSS_Audit_Trail_2026_Term3.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowSuccessToast('Exported Audit Trail to CSV.');
  };

  // Process Bulk CSV Import
  const handleProcessImport = () => {
    try {
      const lines = csvText.trim().split('\n');
      const parsed: Learner[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [admNo, firstName, lastName, rawGrade, rawGender] = line.split(',').map((s) => s.trim());

        if (admNo && firstName && lastName) {
          const grade = rawGrade || 'Grade 8';
          const gender = rawGender?.toUpperCase() === 'F' ? 'F' : 'M';
          parsed.push({
            id: `imported-${admNo}-${Date.now()}`,
            admNo,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            grade,
            gender,
            academicYear: '2026',
            status: 'Active',
            attendanceRate: 95,
          });
        }
      }

      if (parsed.length > 0) {
        onBulkImportLearners(parsed);
        setImportStatus(`Successfully imported ${parsed.length} learners into roster!`);
        onShowSuccessToast(`Bulk imported ${parsed.length} learners.`);
      } else {
        alert('Could not parse any learner rows. Check format: ADM, First Name, Last Name, Grade, Gender');
      }
    } catch {
      alert('Error parsing CSV format. Please check comma separators.');
    }
  };

  // Toggle Grade Lock
  const handleToggleGradeLock = (grade: string) => {
    if (!isSchoolAdmin) {
      alert('School Admin or Super Admin privileges required to toggle marks locks.');
      return;
    }
    setLockedGrades((prev) => {
      const updated = { ...prev, [grade]: !prev[grade] };
      onShowSuccessToast(`${grade} marks entry is now ${updated[grade] ? 'LOCKED' : 'UNLOCKED'}.`);
      return updated;
    });
  };

  // Super Admin: Update User Role
  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin (Principal) can alter staff administrative roles.');
      return;
    }
    const updated = staffUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    syncStaffUsers(updated);
    onShowSuccessToast(`Updated user role to ${newRole}.`);
  };

  // Add Assignment row in New Teacher form
  const handleAddNewAssignmentRow = () => {
    setNewTeacherAssignments((prev) => [...prev, { subject: 'English', grade: 'Grade 7' }]);
  };

  // Remove Assignment row in New Teacher form
  const handleRemoveNewAssignmentRow = (idx: number) => {
    if (newTeacherAssignments.length <= 1) return;
    setNewTeacherAssignments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save New Teacher
  const handleSaveNewTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) {
      alert('Teacher name and email are required.');
      return;
    }

    const newTeacher: UserProfile = {
      id: `usr-${Date.now()}`,
      name: newTeacherName.trim(),
      email: newTeacherEmail.trim(),
      phone: newTeacherPhone.trim() || '+254 700 000 000',
      designation: newTeacherDesignation.trim(),
      role: newTeacherRole,
      tscNumber: newTeacherTsc.trim() || `TSC/${Math.floor(100000 + Math.random() * 900000)}`,
      qualifications: newTeacherQualifications.trim() || 'Bachelor of Education, CBC Certified',
      specialization: newTeacherSpecialization.trim() || newTeacherAssignments.map((a) => a.subject).join(', '),
      backgroundBio: newTeacherBio.trim() || 'Qualified Junior Secondary School educator facilitating competency-based curriculum.',
      assignments: newTeacherAssignments.map((a) => ({
        grade: a.grade,
        subject: a.subject,
      })),
    };

    const updated = [...staffUsers, newTeacher];
    syncStaffUsers(updated);
    onShowSuccessToast(`Added teacher ${newTeacher.name} with ${newTeacher.assignments.length} assigned subject(s).`);

    // Reset and close
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPhone('');
    setNewTeacherTsc('');
    setNewTeacherQualifications('');
    setNewTeacherSpecialization('');
    setNewTeacherBio('');
    setNewTeacherAssignments([{ subject: 'Mathematics', grade: 'Grade 7' }]);
    setShowAddTeacherModal(false);
  };

  // Save Edited Teacher
  const handleSaveEditedTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const updated = staffUsers.map((u) => (u.id === editingTeacher.id ? editingTeacher : u));
    syncStaffUsers(updated);
    onShowSuccessToast(`Updated profile and subject assignments for ${editingTeacher.name}.`);
    setEditingTeacher(null);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Header & Role Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#6b1426]" />
            <span>School Administration &amp; Staff Management</span>
          </h1>
          <p className="text-xs text-stone-600">
            Two-level administrative controls, staff subject allocations, teacher profiles, and tamper-evident audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isSuperAdmin
                ? 'bg-sky-100 text-sky-900 border-sky-300'
                : isSchoolAdmin
                ? 'bg-rose-50 text-[#6b1426] border-rose-200'
                : 'bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            {isSuperAdmin
              ? 'Super Admin (Head Teacher: Mr John Koech)'
              : isSchoolAdmin
              ? 'School Admin (Brian Bett)'
              : 'Class Teacher Access'}
          </span>
        </div>
      </div>

      {/* Role Warning for Standard Teachers */}
      {!isSchoolAdmin && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-sm font-bold text-sky-900">Faculty Account Detected</strong>
            <p>
              You are currently logged in as <strong>{currentUser.name}</strong>. While you can inspect the school audit trail and staff allocations, administrative alterations (bulk import, marks locks, role administration) require <strong>School Admin</strong> or <strong>Super Admin</strong> credentials.
            </p>
            {onSwitchUser && isBrianBett && (
              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const admin = staffUsers.find((u) => u.name.toLowerCase().includes('brian'));
                    if (admin) onSwitchUser(admin);
                  }}
                  className="px-2.5 py-1 bg-[#6b1426] hover:bg-[#540d1e] text-white rounded-lg font-bold text-[11px]"
                >
                  Switch to School Admin (Brian Bett)
                </button>
                <button
                  onClick={() => {
                    const superA = staffUsers.find((u) => u.role === 'super_admin' || u.name.toLowerCase().includes('koech'));
                    if (superA) onSwitchUser(superA);
                  }}
                  className="px-2.5 py-1 bg-sky-800 hover:bg-sky-900 text-white rounded-lg font-bold text-[11px]"
                >
                  Switch to Head Teacher (Mr John Koech)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-stone-200 gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-[#6b1426] text-[#6b1426]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-[#6b1426] text-[#6b1426]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teachers &amp; Subject Assignments ({staffUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'import'
              ? 'border-[#6b1426] text-[#6b1426]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Bulk Admissions (CSV)</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'system'
              ? 'border-[#6b1426] text-[#6b1426]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System &amp; Term Controls</span>
        </button>
      </div>

      {/* TAB 1: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search user, learner, or ADM..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              <select
                value={auditGradeFilter}
                onChange={(e) => setAuditGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:border-[#6b1426] focus:outline-none font-medium"
              >
                <option value="all">All Grades</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
              </select>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:border-[#6b1426] focus:outline-none font-medium"
              >
                <option value="all">All Actions</option>
                <option value="marks">Marks Entry</option>
                <option value="verification">Verification</option>
                <option value="lock">Grade Locks</option>
              </select>
            </div>

            <button
              onClick={handleExportAuditCSV}
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition self-end sm:self-auto border border-stone-200"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100/90 text-stone-700 text-xs font-bold border-b border-stone-200">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">STAFF MEMBER</th>
                    <th className="py-3 px-4">ACTION</th>
                    <th className="py-3 px-4">TARGET / CLASS</th>
                    <th className="py-3 px-4 text-center">CHANGE / MARKS</th>
                    <th className="py-3 px-4">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 px-4 font-mono text-stone-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{log.userName}</div>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">{log.userRole}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-stone-800">{log.action}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{log.learnerName || log.grade}</div>
                          {log.admNo && <span className="font-mono text-stone-500 text-[11px]">ADM {log.admNo}</span>}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {log.previousMark !== null && log.newMark !== null ? (
                            <span className="text-sky-900 font-bold">
                              {log.previousMark}/72 → {log.newMark}/72
                            </span>
                          ) : log.newMark !== null ? (
                            <span className="text-emerald-800 font-bold">{log.newMark}/72</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-600 max-w-xs truncate">{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        No audit records match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#6b1426]" />
                <span>Bulk Learner Admission (CSV Ingestion)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Admit multiple learners simultaneously. Use standard 3-class structure: Grade 7, Grade 8, Grade 9.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Paste CSV Data (Format: ADM, FIRST_NAME, LAST_NAME, GRADE, GENDER):
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-3 font-mono text-xs text-stone-800 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  setCsvText(
                    `ADM,FIRST_NAME,LAST_NAME,GRADE,GENDER\n1025,Dennis,Kipkoech,Grade 7,M\n1026,Cynthia,Chebet,Grade 7,F\n1027,Kevin,Kiplangat,Grade 8,M\n1028,Mercy,Cherotich,Grade 9,F`
                  )
                }
                className="text-xs text-stone-500 hover:text-stone-800 underline"
              >
                Load Sample Batch
              </button>

              <button
                onClick={handleProcessImport}
                disabled={!isSchoolAdmin}
                className="px-5 py-2 rounded-xl bg-[#6b1426] hover:bg-[#52101e] disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Process Batch Admission</span>
              </button>
            </div>

            {importStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STAFF & TEACHER MANAGEMENT WITH ASSIGNED SUBJECTS & BACKGROUND PROFILES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search teacher, TSC, subject, or specialization..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white font-medium"
              >
                <option value="all">All Roles</option>
                <option value="teacher">Teachers</option>
                <option value="school_admin">School Admins</option>
                <option value="super_admin">Super Admins</option>
              </select>

              <select
                value={staffGradeFilter}
                onChange={(e) => setStaffGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white font-medium"
              >
                <option value="all">All Grades</option>
                <option value="Grade 7">Teaching Grade 7</option>
                <option value="Grade 8">Teaching Grade 8</option>
                <option value="Grade 9">Teaching Grade 9</option>
              </select>
            </div>

            {/* Add New Teacher Button */}
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="px-4 py-2 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white text-xs font-black flex items-center gap-2 shadow-xs transition self-stretch sm:self-auto justify-center active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Teacher</span>
            </button>
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStaffUsers.map((usr) => (
              <div
                key={usr.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 transition"
              >
                <div>
                  {/* Card Header: Avatar, Name, Designation, Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6b1426] text-white font-black text-base border-2 border-sky-200 shadow-xs">
                        {usr.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                          <span>{usr.name}</span>
                          {usr.id === currentUser.id && (
                            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-md border border-sky-200">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 font-medium">{usr.designation}</div>
                        <div className="text-[11px] font-mono text-stone-600 mt-0.5">
                          TSC: <strong className="text-stone-800">{usr.tscNumber || 'TSC/649201'}</strong>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                        usr.role === 'super_admin'
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : usr.role === 'school_admin'
                          ? 'bg-rose-50 text-[#6b1426] border-rose-200'
                          : 'bg-stone-100 text-stone-800 border-stone-200'
                      }`}
                    >
                      {usr.role === 'super_admin'
                        ? 'Super Admin'
                        : usr.role === 'school_admin'
                        ? 'School Admin'
                        : 'Class Teacher'}
                    </span>
                  </div>

                  {/* Academic & Background Info */}
                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#6b1426] shrink-0" />
                      <span className="truncate">
                        <strong>Qualifications:</strong> {usr.qualifications || 'B.Ed Science (CBC certified)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-sky-800 shrink-0" />
                      <span className="truncate">
                        <strong>Specialization:</strong> {usr.specialization || 'Sciences & Technical Studies'}
                      </span>
                    </div>
                    {usr.backgroundBio && (
                      <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-xl border border-stone-200/80 mt-1 line-clamp-2">
                        &quot;{usr.backgroundBio}&quot;
                      </p>
                    )}
                  </div>

                  {/* Assigned Subjects in Various Grades */}
                  <div className="mt-3 pt-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                      Assigned Subjects &amp; Classes ({usr.assignments.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {usr.assignments.length > 0 ? (
                        usr.assignments.map((asgn, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-sky-50 text-sky-950 border border-sky-200 px-2 py-0.5 rounded-lg"
                          >
                            <BookOpen className="w-3 h-3 text-sky-700" />
                            <span>{asgn.subject}</span>
                            <span className="text-stone-500 font-mono text-[10px]">({asgn.grade})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">
                          Administrative oversight across all grades.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Edit Profile & Role Change */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTeacher(usr)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#6b1426]" />
                      <span>Edit Profile &amp; Subjects</span>
                    </button>
                  </div>

                  {/* Super Admin role change */}
                  {isSuperAdmin && usr.id !== currentUser.id && (
                    <select
                      value={usr.role}
                      onChange={(e) => handleUpdateRole(usr.id, e.target.value as UserRole)}
                      className="text-xs border border-stone-300 rounded-lg p-1 bg-white font-medium text-stone-700 focus:outline-none"
                    >
                      <option value="teacher">Teacher</option>
                      <option value="school_admin">School Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INSTITUTION & TERM CONTROLS */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          {/* Official Rubber Stamp Verification Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#6b1426] border border-rose-200">
                  <Stamp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Official School Rubber Stamp Security
                  </h3>
                  <p className="text-xs text-stone-500">
                    Mandatory warning configured on all printed report cards and transcripts.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ACTIVE &amp; ENFORCED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-400 uppercase font-bold block text-[10px] mb-1">
                  Enforced Stamp Inscription
                </span>
                <p className="font-mono text-stone-800 font-bold">
                  {SCHOOL_INFO.postalAddress}
                </p>
                <p className="text-stone-500 mt-1">
                  Motto: &quot;{SCHOOL_INFO.motto}&quot;
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-400 uppercase font-bold block text-[10px] mb-1">
                  Mandatory Report Card Warning
                </span>
                <p className="font-semibold text-stone-800 italic">
                  &quot;This document is invalid without the official school rubber stamp.&quot;
                </p>
                <p className="text-emerald-700 font-bold mt-1 text-[11px]">
                  Verified on Print Center report cards.
                </p>
              </div>
            </div>
          </div>

          {/* Grade Marks Entry Lock Status */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">
                  Class Marks Entry Lock / Unlock (Term 3, 2026)
                </h3>
                <p className="text-xs text-stone-500">
                  Admins can lock marks entry once grading deadlines pass to prevent accidental revisions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Grade 7', 'Grade 8', 'Grade 9'].map((grade) => {
                const isLocked = lockedGrades[grade];
                return (
                  <div
                    key={grade}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-stone-900">{grade}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLocked
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLocked ? 'LOCKED' : 'OPEN FOR MARKS'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleGradeLock(grade)}
                      disabled={!isSchoolAdmin}
                      className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isLocked
                          ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                          : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      }`}
                      title={isLocked ? 'Unlock Marks Entry' : 'Lock Marks Entry'}
                    >
                      {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Academic Config */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-stone-900 mb-3">
              Active Institutional Configuration
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Academic Year</span>
                <span className="font-bold text-stone-900">{SCHOOL_INFO.currentYear}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Current Term</span>
                <span className="font-bold text-[#6b1426]">{SCHOOL_INFO.currentTerm}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">School Classes</span>
                <span className="font-bold text-stone-900">3 Classes (Grade 7, 8, 9)</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Assessment Rubric</span>
                <span className="font-bold text-stone-900">Out of 72 (Points 1–8)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW TEACHER & ASSIGN SUBJECTS */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#52101e] bg-[#6b1426] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-sky-200" />
                <h3 className="font-black text-base">Add New Teacher &amp; Assign Subjects</h3>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1.5 rounded-lg text-sky-100 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTeacher} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Teacher Full Name: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr Peter Cheruiyot"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Official Email: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. p.cheruiyot@reberwet.ac.ke"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. +254 722 123 456"
                    value={newTeacherPhone}
                    onChange={(e) => setNewTeacherPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">TSC Registration Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. TSC/582910"
                    value={newTeacherTsc}
                    onChange={(e) => setNewTeacherTsc(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 font-mono font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Official Designation:</label>
                  <input
                    type="text"
                    value={newTeacherDesignation}
                    onChange={(e) => setNewTeacherDesignation(e.target.value)}
                    placeholder="e.g. Junior Secondary Teacher, HOD Sciences"
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Administrative Role:</label>
                  <select
                    value={newTeacherRole}
                    onChange={(e) => setNewTeacherRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 bg-white focus:border-[#6b1426] focus:outline-none font-bold"
                  >
                    <option value="teacher">Class Teacher</option>
                    <option value="school_admin">School Admin (Deputy Head)</option>
                    <option value="super_admin">Super Admin (Head Teacher)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Academic Qualifications:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Ed Science (Mathematics/Chemistry), Egerton University"
                    value={newTeacherQualifications}
                    onChange={(e) => setNewTeacherQualifications(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Teaching Specialization:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Integrated Science, Pre-Technical Studies"
                    value={newTeacherSpecialization}
                    onChange={(e) => setNewTeacherSpecialization(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Background Information &amp; Bio:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 6 years JSS teaching experience, lead science practicals facilitator, games master..."
                    value={newTeacherBio}
                    onChange={(e) => setNewTeacherBio(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>
              </div>

              {/* Assigned Subjects in Various Grades */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#6b1426]" />
                    <span>Assigned Subjects Across Grades</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddNewAssignmentRow}
                    className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Subject</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newTeacherAssignments.map((asgn, index) => (
                    <div
                      key={index}
                      className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2"
                    >
                      <div className="flex-1">
                        <select
                          value={asgn.subject}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewTeacherAssignments((prev) =>
                              prev.map((a, i) => (i === index ? { ...a, subject: val } : a))
                            );
                          }}
                          className="w-full rounded-lg border border-stone-300 p-1.5 text-xs bg-white text-stone-900 font-semibold"
                        >
                          {SUBJECTS.map((subj) => (
                            <option key={subj} value={subj}>
                              {subj}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-36">
                        <select
                          value={asgn.grade}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewTeacherAssignments((prev) =>
                              prev.map((a, i) => (i === index ? { ...a, grade: val } : a))
                            );
                          }}
                          className="w-full rounded-lg border border-stone-300 p-1.5 text-xs bg-white text-stone-900 font-bold"
                        >
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8</option>
                          <option value="Grade 9">Grade 9</option>
                        </select>
                      </div>

                      {newTeacherAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveNewAssignmentRow(index)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold flex items-center gap-2 shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Register Teacher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TEACHER PROFILE, BACKGROUND & ASSIGNED SUBJECTS */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#52101e] bg-[#6b1426] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <Edit3 className="w-5 h-5 text-sky-200" />
                <h3 className="font-black text-base">
                  Edit Teacher Profile &amp; Subject Allocations: {editingTeacher.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 rounded-lg text-sky-100 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTeacher} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teacher Full Name:</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.name}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Official Email:</label>
                  <input
                    type="email"
                    required
                    value={editingTeacher.email}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    value={editingTeacher.phone || ''}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">TSC Registration Number:</label>
                  <input
                    type="text"
                    value={editingTeacher.tscNumber || ''}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, tscNumber: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 font-mono font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Designation:</label>
                  <input
                    type="text"
                    value={editingTeacher.designation}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, designation: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teaching Specialization:</label>
                  <input
                    type="text"
                    value={editingTeacher.specialization || ''}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, specialization: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Qualifications:</label>
                  <input
                    type="text"
                    value={editingTeacher.qualifications || ''}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, qualifications: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Background Bio:</label>
                  <textarea
                    rows={2}
                    value={editingTeacher.backgroundBio || ''}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, backgroundBio: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Assigned Subjects in Various Grades */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#6b1426]" />
                    <span>Assigned Subjects &amp; Grades</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeacher({
                        ...editingTeacher,
                        assignments: [
                          ...editingTeacher.assignments,
                          { subject: 'Integrated Science', grade: 'Grade 8' },
                        ],
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Allocation</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editingTeacher.assignments.map((asgn, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2"
                    >
                      <div className="flex-1">
                        <select
                          value={asgn.subject}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingTeacher({
                              ...editingTeacher,
                              assignments: editingTeacher.assignments.map((a, i) =>
                                i === idx ? { ...a, subject: val } : a
                              ),
                            });
                          }}
                          className="w-full rounded-lg border border-stone-300 p-1.5 text-xs bg-white text-stone-900 font-semibold"
                        >
                          {SUBJECTS.map((subj) => (
                            <option key={subj} value={subj}>
                              {subj}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-36">
                        <select
                          value={asgn.grade}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingTeacher({
                              ...editingTeacher,
                              assignments: editingTeacher.assignments.map((a, i) =>
                                i === idx ? { ...a, grade: val } : a
                              ),
                            });
                          }}
                          className="w-full rounded-lg border border-stone-300 p-1.5 text-xs bg-white text-stone-900 font-bold"
                        >
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8</option>
                          <option value="Grade 9">Grade 9</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeacher({
                            ...editingTeacher,
                            assignments: editingTeacher.assignments.filter((_, i) => i !== idx),
                          });
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove allocation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold flex items-center gap-2 shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Teacher Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
