import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, ArrowRight, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

export function ChooseRolePage() {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const navigate = useNavigate();
  const handleContinue = (role) => {
    if (role === 'STUDENT') {
      navigate('/signup/student');
    } else {
      navigate('/signup/professor');
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-4 sm:px-8 py-5 sm:py-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
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
          <span className="font-bold text-lg tracking-tight text-ink">Open LMS</span>
        </Link>
        <div className="text-xs text-ink-muted">
          Need help?{' '}
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              alert('Support contact: support@openlms.edu');
            }}
            className="text-brand-600 font-semibold hover:underline"
          >
            Contact support
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-6 py-10 flex-1 flex flex-col justify-center">
        {/* Header copy */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2 block">
            Welcome to Open LMS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
            How will you use Open LMS?
          </h1>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            Choose your role so we can shape the right workspace for you.
          </p>
        </div>

        {/* Two Selectable Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Professor Card */}
          <div
            onClick={() => setSelectedRole('PROFESSOR')}
            className={cn(
              'relative bg-white rounded-2xl p-7 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group',
              selectedRole === 'PROFESSOR'
                ? 'border-brand-500 shadow-hero ring-2 ring-brand-100'
                : 'border-ink-border hover:border-slate-300 shadow-soft'
            )}
          >
            {/* Tag */}
            <div className="mb-6 flex justify-between items-start">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Most Common
              </span>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                  selectedRole === 'PROFESSOR'
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-slate-300'
                )}
              >
                {selectedRole === 'PROFESSOR' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* Icon & Illustration */}
            <div className="mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">I'm a professor</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Create courses, share materials, review submissions, and guide student progress.
              </p>
            </div>

            {/* Action button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContinue('PROFESSOR');
                }}
                className={cn(
                  'w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2',
                  selectedRole === 'PROFESSOR'
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
                    : 'bg-slate-100 text-ink hover:bg-slate-200'
                )}
              >
                <span>Continue as professor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Student Card */}
          <div
            onClick={() => setSelectedRole('STUDENT')}
            className={cn(
              'relative bg-white rounded-2xl p-7 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group',
              selectedRole === 'STUDENT'
                ? 'border-brand-500 shadow-hero ring-2 ring-brand-100'
                : 'border-ink-border hover:border-slate-300 shadow-soft'
            )}
          >
            {/* Tag */}
            <div className="mb-6 flex justify-between items-start">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
                Recommended
              </span>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                  selectedRole === 'STUDENT'
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-slate-300'
                )}
              >
                {selectedRole === 'STUDENT' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* Icon & Illustration */}
            <div className="mb-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">I'm a student</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Join classes, manage deadlines, complete quizzes, and keep your learning on track.
              </p>
            </div>

            {/* Action button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContinue('STUDENT');
                }}
                className={cn(
                  'w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2',
                  selectedRole === 'STUDENT'
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
                    : 'bg-slate-100 text-ink hover:bg-slate-200'
                )}
              >
                <span>Continue as student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-10 text-xs text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-ink-muted">
        © 2026 Open LMS. Northbridge Academic Ecosystem.
      </footer>
    </div>
  );
}
