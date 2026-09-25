import React, { useState } from 'react';
import { UserProfile, TeacherAssignment } from '../types';
import { GRADES, SUBJECTS } from '../data/initialData';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  Phone,
  Mail,
  Award,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  Lock,
} from 'lucide-react';

interface DashboardTeachersSectionProps {
  teachers: UserProfile[];
  currentUser: UserProfile;
  onUpdateTeachers: (updated: UserProfile[]) => void;
  onShowSuccessToast: (msg: string) => void;
}

const MAX_TEACHERS = 12;

export const DashboardTeachersSection: React.FC<DashboardTeachersSectionProps> = ({
  teachers,
  currentUser,
  onUpdateTeachers,
  onShowSuccessToast,
}) => {
  const isAdmin = currentUser.role === 'school_admin' || currentUser.role === 'super_admin';
  const [adminMode, setAdminMode] = useState<boolean>(isAdmin);

  // Modal / Form state for Add/Edit
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formPrimarySubject, setFormPrimarySubject] = useState('Mathematics');
  const [formAssignedClass, setFormAssignedClass] = useState('Grade 8');
  const [formTsc, setFormTsc] = useState('');
  const [formDepartment, setFormDepartment] = useState('Languages & Humanities');
  const [formAssignments, setFormAssignments] = useState<TeacherAssignment[]>([]);

  // Capacity calculations
  const teacherCount = teachers.length;
  const isAtCapacity = teacherCount >= MAX_TEACHERS;

  // Open Add Teacher Form
  const handleOpenAdd = () => {
    if (isAtCapacity) {
      alert(`Limit reached: Only ${MAX_TEACHERS} teachers are permitted to register and log in to the school portal.`);
      return;
    }
    setFormName('');
    setFormEmail('');
    setFormPhone('+254 ');
    setFormDesignation('Subject Teacher');
    setFormPrimarySubject('Mathematics');
    setFormAssignedClass('Grade 8');
    setFormTsc('');
    setFormDepartment('Languages & Humanities');
    setFormAssignments([]);
    setIsAddingNew(true);
    setEditingTeacher(null);
  };

  // Open Edit Teacher Form
  const handleOpenEdit = (t: UserProfile) => {
    const canEdit = isAdmin || t.id === currentUser.id;
    if (!canEdit) {
      alert('Only Administrators can edit other teachers. You can edit your own details.');
      return;
    }
    setEditingTeacher(t);
    setFormName(t.name);
    setFormEmail(t.email);
    setFormPhone(t.phone);
    setFormDesignation(t.designation);
    setFormPrimarySubject(t.primarySubject || (t.assignments?.[0]?.subject || 'Mathematics'));
    setFormAssignedClass(t.assignedClass || (t.assignments?.[0]?.grade || 'Grade 8'));
    setFormTsc(t.tscNumber || '');
    setFormDepartment(t.department || 'Languages & Humanities');
    setFormAssignments([...t.assignments]);
    setIsAddingNew(false);
  };

  // Toggle subject assignment for a grade
  const handleToggleSubject = (grade: string, subject: string) => {
    const exists = formAssignments.some(
      (a) => a.grade === grade && a.subject === subject
    );
    if (exists) {
      setFormAssignments(
        formAssignments.filter((a) => !(a.grade === grade && a.subject === subject))
      );
    } else {
      setFormAssignments([...formAssignments, { grade, subject }]);
    }
  };

  // Save Add/Edit
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formEmail.trim()) {
      alert('Please enter a valid teacher name and email address.');
      return;
    }

    if (isAddingNew) {
      if (teachers.length >= MAX_TEACHERS) {
        alert(`Cannot add teacher. School limit of ${MAX_TEACHERS} teachers has been reached.`);
        return;
      }

      const newTeacher: UserProfile = {
        id: `user-teacher-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: 'teacher',
        designation: formDesignation.trim(),
        tscNumber: formTsc.trim(),
        department: formDepartment,
        assignments: formAssignments,
        teachingExperienceYears: 5,
        joiningDate: new Date().toISOString().split('T')[0],
      };

      const next = [...teachers, newTeacher];
      onUpdateTeachers(next);
      onShowSuccessToast(`Teacher ${newTeacher.name} successfully registered with assigned subjects.`);
      setIsAddingNew(false);
    } else if (editingTeacher) {
      const next = teachers.map((t) =>
        t.id === editingTeacher.id
          ? {
              ...t,
              name: formName.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim(),
              designation: formDesignation.trim(),
              primarySubject: formPrimarySubject,
              assignedClass: formAssignedClass,
              tscNumber: formTsc.trim(),
              department: formDepartment,
              assignments: formAssignments,
            }
          : t
      );
      onUpdateTeachers(next);
      onShowSuccessToast(`Teacher details and subject assignments for ${formName} updated.`);
      setEditingTeacher(null);
    }
  };

  // Remove teacher
  const handleDeleteTeacher = (id: string, name: string) => {
    if (teachers.length <= 1) {
      alert('Cannot delete the only registered teacher.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${name} from the teaching roster? This will free up 1 teacher login seat.`)) {
      const next = teachers.filter((t) => t.id !== id);
      onUpdateTeachers(next);
      onShowSuccessToast(`Teacher ${name} removed. Current capacity: ${next.length}/${MAX_TEACHERS}.`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-5" id="teachers-allocations-section">
      {/* Header and Capacity Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6b1426]" />
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Teachers &amp; Subject Allocations (Grade 7 – 9)
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Complete in-page roster of teaching staff with assigned subjects for various junior secondary grades.
          </p>
        </div>

        {/* Capacity Quota Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-bold text-stone-600">Login Seats:</span>
              <span
                className={`text-sm font-black px-2 py-0.5 rounded-md ${
                  isAtCapacity
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {teacherCount} / {MAX_TEACHERS} Active
              </span>
            </div>
            <div className="w-32 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-300 ${
                  isAtCapacity ? 'bg-rose-600' : 'bg-[#6b1426]'
                }`}
                style={{ width: `${(teacherCount / MAX_TEACHERS) * 100}%` }}
              />
            </div>
          </div>

          {/* Admin Toggle / Action */}
          {adminMode ? (
            <button
              onClick={handleOpenAdd}
              disabled={isAtCapacity}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                isAtCapacity
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#6b1426] hover:bg-[#540d1e] text-white shadow-xs'
              }`}
              title={isAtCapacity ? 'Maximum 12 teachers reached' : 'Add new teacher'}
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          ) : (
            <button
              onClick={() => setAdminMode(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#6b1426]" />
              <span>Admin Edit Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Capacity Warning Banner */}
      {isAtCapacity && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>
              <strong>Portal Limit Reached:</strong> The school capacity of 12 registered teachers has been reached. New teachers cannot register or log in unless an existing teacher seat is freed.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-lg border border-rose-200 text-rose-800 shrink-0">
            12 / 12 Max Logins
          </span>
        </div>
      )}

      {/* Teachers Roster List (In-Page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => {
          const isCurrent = teacher.id === currentUser.id;
          const canEdit = isAdmin || isCurrent;
          const canViewConfidential = isAdmin || isCurrent;

          const teachingSubjects = teacher.assignments && teacher.assignments.length > 0
            ? Array.from(new Set(teacher.assignments.map((a) => a.subject)))
            : (teacher.primarySubject ? [teacher.primarySubject] : ['Mathematics']);

          const primarySubj = teacher.primarySubject || teachingSubjects[0] || 'General';
          const assignedClass = teacher.assignedClass || (teacher.assignments?.[0]?.grade || 'Grade 8');
          const department = teacher.department || 'Languages & Humanities';

          // Group assignments by grade
          const g7Subjects = teacher.assignments
            .filter((a) => a.grade.includes('7'))
            .map((a) => a.subject);
          const g8Subjects = teacher.assignments
            .filter((a) => a.grade.includes('8'))
            .map((a) => a.subject);
          const g9Subjects = teacher.assignments
            .filter((a) => a.grade.includes('9'))
            .map((a) => a.subject);

          return (
            <div
              key={teacher.id}
              className={`bg-stone-50/70 border rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition relative group ${
                isCurrent ? 'border-[#6b1426] ring-1 ring-rose-200 bg-white' : 'border-stone-200'
              }`}
            >
              <div>
                {/* Header with Name & Role */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-stone-900 text-sm">
                        {teacher.name}
                      </span>
                      {teacher.role !== 'teacher' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6b1426] text-white">
                          {teacher.role === 'super_admin' ? 'Head Teacher' : 'School Admin'}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {teacher.designation || 'Teacher of Junior Secondary'}
                    </p>
                  </div>

                  {/* Edit Actions: Admin can edit any, teacher can edit own */}
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(teacher)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-[#6b1426] hover:bg-rose-50 transition border border-stone-200"
                        title="Edit teacher information"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && teacher.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-100 transition"
                          title="Remove teacher from roster"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Subject & Assigned Class */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                    <span className="text-[10px] font-black text-[#6b1426] uppercase block">
                      Primary Subject:
                    </span>
                    <span className="font-bold text-stone-900 text-xs truncate block mt-0.5">
                      {primarySubj}
                    </span>
                  </div>

                  <div className="bg-sky-50/70 p-2 rounded-lg border border-sky-100">
                    <span className="text-[10px] font-black text-sky-900 uppercase block">
                      Assigned Class:
                    </span>
                    <span className="font-bold text-stone-900 text-xs truncate block mt-0.5">
                      {assignedClass}
                    </span>
                  </div>
                </div>

                {/* Department & Mobile Number */}
                <div className="mt-2.5 pt-2 border-t border-stone-200 text-xs text-stone-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Department:</span>
                    <span className="font-semibold text-stone-800 text-[11px] truncate max-w-[170px]">{department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Mobile Number:</span>
                    <a href={`tel:${teacher.phone}`} className="font-mono font-bold text-sky-800 hover:underline flex items-center gap-1 text-[11px]">
                      <Phone className="w-3 h-3 text-sky-700" />
                      <span>{teacher.phone || '+254 700 000 000'}</span>
                    </a>
                  </div>

                  {/* Confidential Staff Records: ONLY visible to Admin or Self */}
                  {canViewConfidential ? (
                    teacher.tscNumber && (
                      <div className="flex items-center justify-between text-[11px] bg-amber-50 p-1.5 rounded border border-amber-200">
                        <span className="text-amber-900 font-bold flex items-center gap-1 text-[10px]">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Confidential TSC:</span>
                        </span>
                        <span className="font-mono font-bold text-amber-950 text-[10.5px]">
                          {teacher.tscNumber}
                        </span>
                      </div>
                    )
                  ) : null}
                </div>

                {/* Assigned Teaching Subjects For Various Grades */}
                <div className="mt-3 pt-2.5 border-t border-stone-200 space-y-2">
                  <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#6b1426]" />
                    <span>Assigned Subjects</span>
                  </div>

                  {/* Grade 7 */}
                  <div className="bg-white p-2 rounded-lg border border-stone-200 text-xs">
                    <span className="font-bold text-[#6b1426] text-[11px] block mb-1">Grade 7:</span>
                    {g7Subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {g7Subjects.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-rose-50 text-[#6b1426] border border-rose-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-400 italic text-[11px]">No Grade 7 subjects</span>
                    )}
                  </div>

                  {/* Grade 8 */}
                  <div className="bg-white p-2 rounded-lg border border-stone-200 text-xs">
                    <span className="font-bold text-sky-800 text-[11px] block mb-1">Grade 8:</span>
                    {g8Subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {g8Subjects.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-sky-50 text-sky-900 border border-sky-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-400 italic text-[11px]">No Grade 8 subjects</span>
                    )}
                  </div>

                  {/* Grade 9 */}
                  <div className="bg-white p-2 rounded-lg border border-stone-200 text-xs">
                    <span className="font-bold text-amber-900 text-[11px] block mb-1">Grade 9:</span>
                    {g9Subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {g9Subjects.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-50 text-amber-950 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-400 italic text-[11px]">No Grade 9 subjects</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  <span>Authorized Seat</span>
                </span>
                <span>{teacher.assignments.length} total subjects</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal Dialog (School Admin) */}
      {(isAddingNew || editingTeacher) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {isAddingNew ? 'Add New Teacher' : `Edit Teacher: ${editingTeacher?.name}`}
                </h3>
                <p className="text-xs text-stone-600">
                  Update staff details and assign teaching subjects across Grade 7, 8, and 9.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingTeacher(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teacher Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Mr. David Kipkoech"
                    className="w-full rounded-xl border border-stone-300 p-2.5 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. d.kipkoech@reberwet.ac.ke"
                    className="w-full rounded-xl border border-stone-300 p-2.5 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+254 712 345 678"
                    className="w-full rounded-xl border border-stone-300 p-2.5 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Primary Subject *</label>
                  <select
                    value={formPrimarySubject}
                    onChange={(e) => setFormPrimarySubject(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Assigned Class *</label>
                  <select
                    value={formAssignedClass}
                    onChange={(e) => setFormAssignedClass(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="All Grades">All Grades (Specialist / Admin)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Assigned Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none"
                  >
                    <option value="Pure & Applied Sciences">Pure &amp; Applied Sciences</option>
                    <option value="Mathematics & Technical Studies">Mathematics &amp; Technical Studies</option>
                    <option value="Languages & Humanities">Languages &amp; Humanities</option>
                    <option value="Languages & Social Sciences">Languages &amp; Social Sciences</option>
                    <option value="Creative Arts & Sports">Creative Arts &amp; Sports</option>
                    <option value="Administration & Humanities">Administration &amp; Humanities</option>
                  </select>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">TSC Number (Admin/Confidential)</label>
                    <input
                      type="text"
                      value={formTsc}
                      onChange={(e) => setFormTsc(e.target.value)}
                      placeholder="TSC/849201"
                      className="w-full rounded-xl border border-stone-300 p-2.5 focus:border-[#6b1426] focus:outline-none font-mono"
                    />
                  </div>
                )}

                <div className={isAdmin ? '' : 'sm:col-span-2'}>
                  <label className="block font-bold text-stone-700 mb-1">Designation &amp; Role</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Class Teacher Grade 8 & Science Lead"
                    className="w-full rounded-xl border border-stone-300 p-2.5 focus:border-[#6b1426] focus:outline-none"
                  />
                </div>
              </div>

              {/* Assign Teaching Subjects For Each Grade */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Assign Teaching Subjects by Grade
                </label>
                <p className="text-[11px] text-stone-500">
                  Tap to toggle which subjects this teacher handles in Grade 7, Grade 8, and Grade 9:
                </p>

                {GRADES.map((g) => (
                  <div key={g.id} className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                    <span className="text-xs font-black text-stone-900 block mb-2">
                      {g.name} Teaching Subjects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUBJECTS.map((subj) => {
                        const isSelected = formAssignments.some(
                          (a) => a.grade === g.id && a.subject === subj
                        );
                        return (
                          <button
                            type="button"
                            key={`${g.id}-${subj}`}
                            onClick={() => handleToggleSubject(g.id, subj)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              isSelected
                                ? 'bg-[#6b1426] text-white shadow-2xs'
                                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {subj}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#6b1426] hover:bg-[#540d1e] text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAddingNew ? 'Save New Teacher' : 'Update Teacher Allocations'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
