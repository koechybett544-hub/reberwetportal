import React, { useState } from 'react';
import { UserProfile } from '../types';
import { SCHOOL_INFO, SUBJECTS, GRADES } from '../data/initialData';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  ShieldCheck,
  Calendar,
  BookOpen,
  Edit3,
  Save,
  Check,
  Briefcase,
  FileText,
  Sparkles,
} from 'lucide-react';

interface TeacherProfileProps {
  currentUser: UserProfile;
  onNavigate: (view: string) => void;
  onUpdateCurrentUser?: (updated: UserProfile) => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({
  currentUser,
  onNavigate,
  onUpdateCurrentUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+254 712 345 678');
  const [tscNumber, setTscNumber] = useState(currentUser.tscNumber || 'TSC/649201');
  const [designation, setDesignation] = useState(currentUser.designation);
  const [qualifications, setQualifications] = useState(
    currentUser.qualifications || 'Bachelor of Education (Arts / Science), University of Nairobi'
  );
  const [specialization, setSpecialization] = useState(
    currentUser.specialization || 'Languages & Integrated Science'
  );
  const [backgroundBio, setBackgroundBio] = useState(
    currentUser.backgroundBio ||
      'Dedicated educator with extensive experience in competency-based curriculum (CBC) delivery, formative assessment rubrics, and learner mentorship in Junior Secondary School.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      tscNumber: tscNumber.trim(),
      designation: designation.trim(),
      qualifications: qualifications.trim(),
      specialization: specialization.trim(),
      backgroundBio: backgroundBio.trim(),
    };

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(updated);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <User className="w-6 h-6 text-[#6b1426]" />
            <span>Staff Profile &amp; Background</span>
          </h1>
          <p className="text-xs text-stone-600">
            Official faculty credentials, academic background, TSC registration, and CBC subject allocations at {SCHOOL_INFO.name}.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile & Bio'}</span>
        </button>
      </div>

      {isEditing ? (
        /* EDIT PROFILE FORM */
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#6b1426]" />
              <span>Update Teacher Profile &amp; Background Information</span>
            </h3>
            <span className="text-xs text-stone-500">Official Faculty Record</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Full Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Official Designation:</label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Official Email:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Phone Number:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">TSC Registration Number:</label>
              <input
                type="text"
                value={tscNumber}
                onChange={(e) => setTscNumber(e.target.value)}
                placeholder="e.g. TSC/649201"
                className="w-full rounded-xl border border-stone-300 p-2.5 font-mono font-bold text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Teaching Specialization:</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Mathematics, Integrated Science"
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Academic &amp; Professional Qualifications:</label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. Bachelor of Education (Science), Kenyatta University; Diploma in Educational Management"
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Professional Background &amp; Bio:</label>
              <textarea
                rows={3}
                value={backgroundBio}
                onChange={(e) => setBackgroundBio(e.target.value)}
                placeholder="Brief summary of teaching background, CBC facilitation experience, committee roles..."
                className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-900 focus:border-[#6b1426] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* VIEW PROFILE CARDS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Avatar & Identity */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#6b1426] text-white font-black text-2xl border-4 border-sky-100 shadow-md">
              {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <h2 className="text-lg font-black text-stone-900">{currentUser.name}</h2>
              <p className="text-xs text-stone-500 font-medium">{currentUser.designation}</p>
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-200">
              {currentUser.role === 'teacher'
                ? 'Class Teacher'
                : currentUser.role === 'school_admin'
                ? 'School Administrator (Deputy)'
                : 'Head Teacher (Super Admin)'}
            </div>

            <div className="w-full pt-4 border-t border-stone-100 space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <Mail className="w-4 h-4 text-[#6b1426] shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-4 h-4 text-[#6b1426] shrink-0" />
                <span>{currentUser.phone || '+254 712 345 678'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-[#6b1426] shrink-0" />
                <span>
                  TSC No: <strong className="font-mono text-stone-800">{currentUser.tscNumber || 'TSC/649201'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 & 3: Background & Subject Allocations */}
          <div className="md:col-span-2 space-y-5">
            {/* Professional Background & Bio Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <Briefcase className="w-4 h-4 text-[#6b1426]" />
                <span>Academic Credentials &amp; Professional Background</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Academic Qualifications</span>
                  <p className="font-bold text-stone-900 mt-0.5">
                    {currentUser.qualifications || 'Bachelor of Education (Science)'}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Teaching Specialization</span>
                  <p className="font-bold text-stone-900 mt-0.5">
                    {currentUser.specialization || 'Mathematics, Integrated Science'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">
                  Background Summary &amp; Experience Bio
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {currentUser.backgroundBio ||
                    'Experienced junior secondary school educator with active engagement in continuous professional development (CPD), learner mentoring, and competency-based assessment alignment.'}
                </p>
              </div>
            </div>

            {/* Assigned Grades & Subjects Across Classes */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#6b1426]" />
                  <span>Assigned Subjects in Various Grades</span>
                </h3>
                <span className="text-xs text-stone-500">
                  {currentUser.assignments?.length || 0} active allocations
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentUser.assignments && currentUser.assignments.length > 0 ? (
                  currentUser.assignments.map((asgn, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-1 hover:border-sky-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-stone-900 text-sm">
                          {asgn.grade}
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-[#6b1426] text-white px-2 py-0.5 rounded">
                          Teaching
                        </span>
                      </div>
                      <div className="text-xs text-sky-950 font-semibold flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-sky-800" />
                        <span>{asgn.subject}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-stone-500 sm:col-span-2 bg-stone-50 rounded-xl">
                    Administrative leadership across all Junior Secondary School grades (Grade 7, Grade 8, Grade 9).
                  </div>
                )}
              </div>
            </div>

            {/* Institution & Session Details */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6b1426]" />
                <span>School &amp; Academic Session</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Institution</span>
                  <span className="font-bold text-stone-900">{SCHOOL_INFO.name}</span>
                  <p className="text-[11px] text-stone-500">{SCHOOL_INFO.postalAddress}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Current Session</span>
                  <span className="font-bold text-[#6b1426]">
                    {SCHOOL_INFO.currentYear} • {SCHOOL_INFO.currentTerm}
                  </span>
                  <p className="text-[11px] text-stone-500">{SCHOOL_INFO.termDates}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
