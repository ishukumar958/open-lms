import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Compass,
  Users,
  Clock,
  Shield,
  Layers,
  Award,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-ink flex flex-col">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
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
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-ink">Open LMS</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-muted">
            <a href="#why" className="hover:text-brand-600 transition-colors">
              Why Open LMS
            </a>
            <a href="#students" className="hover:text-brand-600 transition-colors">
              For students
            </a>
            <a href="#educators" className="hover:text-brand-600 transition-colors">
              For educators
            </a>
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Resources
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-ink-muted hover:text-ink transition-colors px-2 py-1"
            >
              Sign in
            </Link>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/choose-role')}
              className="rounded-full shadow-brand font-semibold text-xs px-3 sm:px-5"
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F2F0FF] via-[#FAF9FF] to-white pt-12 pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200/80 shadow-2xs text-xs font-semibold text-brand-600">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Learning feels lighter here</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.12]">
              Your campus life, <br />
              <span className="text-brand-500">all in one place.</span>
            </h1>

            <p className="text-lg text-ink-muted leading-relaxed max-w-xl font-normal">
              Open LMS brings classes, assignments, quizzes, feedback, and conversations
              together so everyone can focus on meaningful progress.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/choose-role')}
                className="rounded-full shadow-hero px-7 font-semibold"
                iconRight={ArrowRight}
              >
                Start learning
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full bg-white border-slate-200 px-6 font-semibold"
              >
                Explore the platform
              </Button>
            </div>

            {/* Social Proof Avatars */}
            <div className="pt-6 flex items-center gap-3.5">
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full ring-2 ring-white bg-gradient-to-tr from-violet-500 to-indigo-400 text-white font-bold text-xs flex items-center justify-center">
                  RS
                </div>
                <div className="w-9 h-9 rounded-full ring-2 ring-white bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  AV
                </div>
                <div className="w-9 h-9 rounded-full ring-2 ring-white bg-gradient-to-tr from-emerald-400 to-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  AG
                </div>
              </div>
              <p className="text-xs font-medium text-ink-muted">
                <strong className="text-ink font-bold">12,000+ learners</strong> already finding their flow
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Mockup Card Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100/80 transform lg:rotate-1 hover:rotate-0 transition-all duration-300">
              {/* Header inside mockup */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">OL</span>
                  </div>
                  <span className="text-xs font-bold text-ink">Open LMS</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </div>
              </div>

              {/* Greeting */}
              <div className="pt-4">
                <p className="text-sm font-bold text-ink">Good morning, Rahul 👋</p>
                <p className="text-[11px] text-ink-muted">Graphic Era · Computer Science</p>
              </div>

              {/* Mini Stat Tiles */}
              <div className="grid grid-cols-3 gap-2.5 my-4">
                <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-100">
                  <span className="text-lg font-bold text-violet-700">4</span>
                  <p className="text-[10px] font-medium text-violet-600 leading-tight">Classes</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-lg font-bold text-amber-700">3</span>
                  <p className="text-[10px] font-medium text-amber-600 leading-tight">Due this week</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-lg font-bold text-emerald-700">92%</span>
                  <p className="text-[10px] font-medium text-emerald-600 leading-tight">Avg. grade</p>
                </div>
              </div>

              {/* Coming Up Next */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
                  Coming up next
                </p>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-ink">Cell Biology quiz</p>
                      <p className="text-[10px] text-ink-muted">BIO 214 · 10:30 AM</p>
                    </div>
                    <span className="text-xs text-brand-600 font-bold">→</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-ink">Design critique</p>
                      <p className="text-[10px] text-ink-muted">DES 202 · Tomorrow</p>
                    </div>
                    <span className="text-xs text-brand-600 font-bold">→</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-ink">Research brief</p>
                      <p className="text-[10px] text-ink-muted">SOC 110 · Friday</p>
                    </div>
                    <span className="text-xs text-brand-600 font-bold">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: "Built for everyday learning" */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
            Built for everyday learning
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Less platform. More progress.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-ink-border hover:shadow-card transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2.5">One calm place to learn</h3>
            <p className="text-sm text-ink-muted leading-relaxed font-normal">
              Courses, deadlines, discussion, and feedback stay organized in one focused workspace.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-ink-border hover:shadow-card transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2.5">Momentum you can see</h3>
            <p className="text-sm text-ink-muted leading-relaxed font-normal">
              Friendly progress signals help every learner know what matters next without feeling overwhelmed.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-ink-border hover:shadow-card transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2.5">Teaching, simplified</h3>
            <p className="text-sm text-ink-muted leading-relaxed font-normal">
              Professors publish, review, and respond without losing the human context.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 py-10 bg-slate-50 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center text-white text-[10px]">
              OL
            </div>
            Open LMS
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-ink">Privacy</a>
            <a href="#terms" className="hover:text-ink">Terms</a>
            <a href="#accessibility" className="hover:text-ink">Accessibility</a>
            <span>© 2026 Open LMS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
