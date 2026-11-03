import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Calendar,
  FileCheck2,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
  LogOut,
  ChevronUp,
  LayoutDashboard,
  Layers,
  Inbox,
  Award,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

export function Sidebar() {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isProf = role === 'PROFESSOR' || role === 'FACULTY' || user?.role === 'PROFESSOR' || user?.role === 'FACULTY';

  const studentNav = [
    { label: 'Home', to: '/student/home', icon: Home },
    { label: 'My classes', to: '/student/classes', icon: BookOpen },
    { label: 'Calendar', to: '/student/calendar', icon: Calendar },
    { label: 'Assignments', to: '/student/assignments', icon: FileCheck2 },
    { label: 'Messages', to: '/messages', icon: MessageSquare, badge: 2 },
  ];

  const professorNav = [
    { label: 'Overview', to: '/professor/overview', icon: LayoutDashboard },
    { label: 'My courses', to: '/professor/courses', icon: Layers },
    { label: 'Submissions', to: '/professor/submissions', icon: Inbox, badge: 12 },
    { label: 'Gradebook', to: '/professor/gradebook', icon: Award },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
  ];

  const navItems = isProf ? professorNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 shrink-0 bg-navy-900 text-white flex flex-col justify-between h-screen sticky top-0 border-r border-navy-800 z-30 select-none">
      {/* Brand & Top Navigation */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Open LMS</span>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150',
                    isActive
                      ? 'bg-navy-800 text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-brand-400' : 'text-slate-400'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Support Card & User Chip */}
      <div className="p-3.5 space-y-3">
        {/* Help Center Card */}
        <div className="p-3.5 rounded-xl bg-navy-800/80 border border-navy-700/60 backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
            <span>Need a hand?</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug mb-2">
            Visit the Open LMS help center for guides and FAQs.
          </p>
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              alert('Redirecting to Open LMS Student Support Center.');
            }}
            className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 group"
          >
            Help Center
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* User Account Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-navy-800 transition-colors text-left group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar
                initials={user?.avatarInitials}
                size="sm"
                color={isProf ? 'blue' : 'brand'}
              />
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Account'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {isProf ? 'Faculty / Professor' : 'Student Account'}
                </div>
              </div>
            </div>
            <ChevronUp
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0',
                showUserMenu ? 'rotate-180' : ''
              )}
            />
          </button>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-navy-800 border border-navy-700 rounded-xl shadow-hero z-40 text-xs space-y-1">
              <div className="px-2.5 py-1.5 border-b border-navy-700/80 mb-1">
                <p className="text-white font-semibold truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-navy-700 text-brand-300">
                  {isProf ? 'Professor' : 'Student'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/messages');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-navy-700 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Messages & Help</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-900/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
