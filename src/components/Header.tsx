import React from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_USERS } from '../data/initialData';
import {
  HelpCircle,
  Bell,
  User,
  Wifi,
  WifiOff,
  ChevronDown,
  ArrowLeft,
  GraduationCap,
  Mail,
  LogIn,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onOpenHelp: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  currentView: string;
  onBack?: () => void;
  breadcrumbs?: { label: string; view?: string }[];
  onNavigate: (view: string) => void;
  teachers?: UserProfile[];
  onOpenAuthModal?: () => void;
  onOpenGmail?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  onOpenHelp,
  onOpenNotifications,
  unreadNotificationsCount,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  currentView,
  onBack,
  breadcrumbs,
  onNavigate,
  teachers,
  onOpenAuthModal,
  onOpenGmail,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const isBrianBett = currentUser.role === 'super_admin' || currentUser.name.toLowerCase().includes('brian');

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-bold px-1.5 py-0.5 rounded">Super Admin</span>;
      case 'school_admin':
        return <span className="bg-rose-100 text-rose-950 border border-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded">School Admin</span>;
      case 'teacher':
      default:
        return <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold px-1.5 py-0.5 rounded">Teacher</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#6b1426] text-white shadow-md border-b border-[#540d1e]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Back / Breadcrumb */}
          <div className="flex items-center gap-3">
            {onBack && currentView !== 'dashboard' && (
              <button
                id="header-back-btn"
                onClick={onBack}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white rounded-lg px-2 py-1.5 text-xs font-semibold transition active:scale-95"
                title="Return to previous screen"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#540d1e] border border-sky-300/40 text-sky-200 shadow-inner group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5">
                  <span>REBERWET JSS</span>
                  <span className="hidden md:inline-block text-[10px] font-medium bg-[#3b0a16] px-1.5 py-0.5 rounded text-sky-200 border border-[#8c1632]">
                    2026 Term 3
                  </span>
                </div>
                <div className="text-[11px] text-sky-100/90 hidden sm:block">
                  Junior Secondary School Portal
                </div>
              </div>
            </button>
          </div>

          {/* Right: Tools, Role switcher, Gmail, APK & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Gmail Quick Desk */}
            {onOpenGmail && (
              <button
                onClick={onOpenGmail}
                id="header-gmail-btn"
                title="School Gmail Communication Desk"
                className="flex items-center gap-1 bg-[#540d1e] hover:bg-[#3b0a16] text-sky-200 border border-sky-300/40 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Gmail</span>
              </button>
            )}

            {/* Offline Simulation toggle */}
            <button
              onClick={onToggleSimulatedOffline}
              id="toggle-offline-simulation-btn"
              title={isSimulatedOffline ? 'Switch back to Online mode' : 'Simulate Offline mode to test auto-save safety'}
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition ${
                isSimulatedOffline
                  ? 'bg-amber-400 text-stone-950 font-bold animate-pulse'
                  : 'bg-[#540d1e]/80 hover:bg-[#3b0a16] text-sky-100 border border-[#8c1632]'
              }`}
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-sky-300" />
                  <span className="hidden xl:inline text-sky-100">Online</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              id="notifications-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-[#540d1e] hover:bg-[#3b0a16] text-sky-100 transition border border-[#8c1632]"
              title="Announcements & Notices"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-400 text-[10px] font-bold text-stone-950">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Staff Google / OTP Auth Button */}
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                id="header-auth-btn"
                className="flex items-center gap-1.5 bg-[#540d1e] hover:bg-[#3b0a16] border border-sky-300/40 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition"
                title="Sign Up or Log In via Email, Phone, or Google"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-200" />
                <span className="hidden md:inline">Sign Up / Log In</span>
              </button>
            )}

            {/* User Account / Role Switcher */}
            <div className="relative">
              <button
                id="user-role-dropdown-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 bg-[#540d1e] hover:bg-[#3b0a16] border border-sky-300/40 rounded-xl px-2.5 py-1.5 text-left transition"
                title="Switch active user or role"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-700 text-white font-bold text-xs">
                  {currentUser.name.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-sky-200 leading-none">
                    {currentUser.role === 'teacher' ? 'Teacher' : currentUser.role === 'school_admin' ? 'Admin' : 'Head Teacher'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-sky-200" />
              </button>

              {/* Role Switcher Dropdown */}
              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-2 shadow-2xl border border-stone-200 text-stone-800 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-stone-100 mb-1">
                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Active Account</p>
                      <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                      <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                    </div>

                    {/* ONLY Admin (Brian Bett) is authorized to switch accounts */}
                    {isBrianBett ? (
                      <>
                        <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-stone-500">
                          <span>Switch Faculty Seat:</span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-200">Admin Only</span>
                        </div>
                        <div className="space-y-1 max-h-56 overflow-y-auto">
                          {(teachers && teachers.length > 0 ? teachers : DEFAULT_USERS).map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                onSwitchUser(u);
                                setRoleDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                                u.id === currentUser.id
                                  ? 'bg-rose-50 font-bold text-rose-950 border border-rose-200'
                                  : 'hover:bg-stone-50 text-stone-700'
                              }`}
                            >
                              <div>
                                <div className="font-semibold">{u.name}</div>
                                <div className="text-[10px] text-stone-500">{u.designation}</div>
                              </div>
                              {getRoleBadge(u.role)}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800 mb-1">
                          <Lock className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                          <span>Protected Seat</span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          Account switching is restricted to School Administrator (Brian Bett).
                        </p>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-stone-100 space-y-1">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-md font-medium flex items-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-[#6b1426]" />
                        <span>View My Profile</span>
                      </button>

                      {onOpenAuthModal && (
                        <button
                          onClick={() => {
                            onOpenAuthModal();
                            setRoleDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#6b1426] hover:bg-rose-50 rounded-md font-bold flex items-center gap-1.5"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Create Account / Log In</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb line for deep screens */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="py-1.5 border-t border-[#8c1632] text-[11px] text-sky-200 flex items-center gap-1 overflow-x-auto">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-sky-300/60">/</span>}
                {b.view ? (
                  <button
                    onClick={() => onNavigate(b.view!)}
                    className="hover:underline font-medium text-white shrink-0"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span className="font-semibold text-white shrink-0">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
