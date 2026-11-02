import React, { useState } from 'react';
import { SearchInput } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Bell, Plus, ChevronDown, Check, GraduationCap, Briefcase, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { joinCourse } from '../../lib/api/coursesApi';

export function Topbar({ title, subtitle }) {
  const { role, user } = useAuthStore();
  const navigate = useNavigate();

  // Modals & popovers state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    const cleanCode = classCode.trim().toUpperCase();
    if (!cleanCode) return;
    setJoinError('');
    setIsJoining(true);
    try {
      await joinCourse({ courseCode: cleanCode });
      setIsJoinSuccess(true);
      setTimeout(() => {
        setIsJoinSuccess(false);
        setIsJoinModalOpen(false);
        setClassCode('');
        navigate('/student/classes');
        window.location.reload();
      }, 1000);
    } catch (err) {
      setJoinError(err.message || 'Invalid class code or already enrolled.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <header className="min-h-16 px-4 sm:px-6 md:px-8 py-2 border-b border-ink-border bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-3">
        {/* Left: Dynamic Greeting or Page Title */}
        <div className="min-w-0">
          {title ? (
            <div className="flex items-baseline gap-3">
              <h1 className="text-lg font-bold text-ink tracking-tight">{title}</h1>
              {subtitle && <span className="text-xs text-ink-muted">{subtitle}</span>}
            </div>
          ) : (
            <div>
              <h1 className="text-sm sm:text-base font-bold text-ink tracking-tight truncate">
                {role === 'PROFESSOR'
                  ? `Good morning, ${user?.name || 'Professor'}`
                  : `Good morning, ${user?.name || 'Student'} 👋`}
              </h1>
              <p className="hidden sm:block text-[11px] text-ink-muted truncate">
                {role === 'PROFESSOR'
                  ? 'Faculty Academic Workspace · Active Semester'
                  : 'Student Learning Portal · Current Semester'}
              </p>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* User Role Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            {role === 'PROFESSOR' ? (
              <>
                <Briefcase className="w-3.5 h-3.5" />
                <span>Faculty Workspace</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student View</span>
              </>
            )}
          </div>

          {/* Search Bar */}
          <SearchInput className="hidden md:block" placeholder="Search Open LMS..." />

          {/* Contextual Action Button */}
          {role === 'STUDENT' ? (
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsJoinModalOpen(true)}
              className="font-semibold text-xs border-slate-300"
            >
              <span className="hidden sm:inline">Join a class</span>
              <span className="sm:hidden">Join</span>
            </Button>
          ) : (
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                iconRight={ChevronDown}
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                className="font-semibold text-xs"
              >
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden">New</span>
              </Button>
              {isCreateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-ink-border rounded-xl shadow-hero py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      navigate('/professor/courses?action=new');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-ink"
                  >
                    New course
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      navigate('/professor/courses');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-ink"
                  >
                    New assignment
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      navigate('/professor/courses');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-ink"
                  >
                    New quiz
                  </button>
                  <div className="h-px bg-ink-border my-1" />
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      alert('Work in Progress: Real-time broadcast announcements are currently in development.');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-brand-600"
                  >
                    Post announcement
                  </button>
                </div>
              )}
            </div>
          )}

          {/* API Health & Diagnostics Button */}
          <button
            onClick={() => navigate('/health')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
            title="Inspect API Health & Live Diagnostics"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>API Status</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setHasUnread(false);
              }}
              className="w-9 h-9 rounded-lg border border-ink-border bg-white flex items-center justify-center text-ink-muted hover:text-ink hover:bg-slate-50 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white border border-ink-border rounded-xl shadow-hero p-3.5 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-ink-border mb-2.5">
                  <span className="font-bold text-ink">Notifications</span>
                  <button
                    onClick={() => setHasUnread(false)}
                    className="text-[10px] text-brand-600 font-semibold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-100 text-ink">
                    <p className="font-bold text-xs text-brand-950 flex items-center gap-1.5">
                      <span>Welcome to Open LMS!</span> 👋
                    </p>
                    <p className="text-[11px] text-brand-800 mt-1 leading-relaxed">
                      {role === 'PROFESSOR'
                        ? 'Your teaching portal is active. Create courses, upload study resources, and manage student submissions.'
                        : 'Your student account is active. Use the "+ Join a class" button above with your instructor\'s class code to enroll.'}
                    </p>
                    <span className="text-[10px] text-brand-600 font-semibold block mt-1.5">Just now</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-ink">
                    <p className="font-bold text-xs text-slate-900">Academic Account Verified</p>
                    <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                      Signed in as <span className="font-semibold text-slate-700">{user?.email || 'authenticated user'}</span> ({role === 'PROFESSOR' ? 'Faculty' : 'Student'}).
                    </p>
                    <span className="text-[10px] text-ink-muted font-medium block mt-1.5">Today</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Join a Class Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setJoinError('');
        }}
        title="Join a class"
        description="Enter the unique class code provided by your instructor to enroll."
      >
        <form onSubmit={handleJoinClass} className="space-y-4 pt-2">
          {joinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span>{joinError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Class Code
            </label>
            <input
              type="text"
              maxLength={12}
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g. CS-301 or K7M2QX"
              className="w-full text-center tracking-widest text-lg font-mono font-bold uppercase py-3 border border-ink-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsJoinModalOpen(false);
                setJoinError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!classCode.trim() || isJoining}
            >
              {isJoining ? (
                'Enrolling...'
              ) : isJoinSuccess ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-white" /> Enrolled!
                </span>
              ) : (
                'Enroll now'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
