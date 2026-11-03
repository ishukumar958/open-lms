import React, { useState, useEffect } from 'react';
import { listMyGroups } from '../../lib/api/chatApi';
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
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchUnread = () => {
      listMyGroups()
        .then((groups) => {
          if (!mounted || !Array.isArray(groups)) return;
          const total = groups.reduce((acc, g) => acc + (g.unreadCount || 0), 0);
          setUnreadChatCount(total);
        })
        .catch(() => {});
    };

    fetchUnread();
    const handleReadEvent = () => fetchUnread();
    window.addEventListener('chat_read_updated', handleReadEvent);

    return () => {
      mounted = false;
      window.removeEventListener('chat_read_updated', handleReadEvent);
    };
  }, [user?.id]);

  const studentNav = [
    { label: 'Home', to: '/student/home', icon: Home },
    { label: 'My classes', to: '/student/classes', icon: BookOpen },
    { label: 'Calendar', to: '/student/calendar', icon: Calendar },
    { label: 'Assignments', to: '/student/assignments', icon: FileCheck2 },
    { label: 'Messages', to: '/messages', icon: MessageSquare, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
  ];

  const professorNav = [
    { label: 'Overview', to: '/professor/overview', icon: LayoutDashboard },
    { label: 'My courses', to: '/professor/courses', icon: Layers },
    { label: 'Submissions', to: '/professor/submissions', icon: Inbox },
    { label: 'Gradebook', to: '/professor/gradebook', icon: Award },
    { label: 'Messages', to: '/messages', icon: MessageSquare, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
  ];

  const navItems = isProf ? professorNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="dark-sidebar fixed bottom-0 left-0 right-0 w-full h-16 md:inset-y-0 md:left-0 md:right-auto md:w-56 md:h-screen shrink-0 bg-navy-900 text-white flex flex-col justify-between border-t md:border-t-0 md:border-r border-navy-800 z-30 select-none">
      {/* Brand & Top Navigation */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="hidden md:flex p-5 items-center gap-2.5">
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
        <nav
          aria-label="Primary navigation"
          className="flex h-16 px-1 gap-1 overflow-x-auto md:block md:h-auto md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:px-3 md:space-y-1 md:mt-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all duration-150 md:min-w-0 md:flex-row md:justify-between md:px-3.5 md:py-2.5 md:text-xs',
                    isActive
                      ? 'bg-navy-800 text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex flex-col items-center gap-0.5 md:flex-row md:gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-brand-400' : 'text-slate-400'
                        )}
                      />
                      <span className="whitespace-nowrap">{item.label}</span>
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
      <div className="hidden md:block p-3.5 space-y-3">
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
