import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { promptGoogleLogin } from '../../lib/googleAuth';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated, user, role } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      const isProf = role === 'PROFESSOR' || role === 'FACULTY' || user?.role === 'PROFESSOR' || user?.role === 'FACULTY';
      const redirect = searchParams.get('redirect');
      navigate(redirect || (isProf ? '/professor/overview' : '/student/home'), { replace: true });
    }
  }, [isAuthenticated, user, role, navigate, searchParams]);

  const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN;
  const defaultDomain = allowedDomain || 'geu.edu';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (allowedDomain && !email.toLowerCase().endsWith('@' + allowedDomain.toLowerCase())) {
      setError(`Please sign in with your @${allowedDomain} email address.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login(email, password, undefined, keepSignedIn);
      setIsSubmitting(false);

      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else {
        navigate((user.role === 'PROFESSOR' || user.role === 'FACULTY')
          ? '/professor/overview' : '/student/home');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Unable to sign in.');
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    promptGoogleLogin({
      onStart: () => setIsGoogleLoading(true),
      onSuccess: async ({ accessToken, roleName }) => {
        try {
          const user = await googleLogin({ accessToken, roleName }, keepSignedIn);
          setIsGoogleLoading(false);
          const redirect = searchParams.get('redirect');
          if (redirect) {
            navigate(redirect);
          } else {
            navigate((user.role === 'PROFESSOR' || user.role === 'FACULTY')
              ? '/professor/overview' : '/student/home');
          }
        } catch (err) {
          setIsGoogleLoading(false);
          setError(err.message || 'Google sign-in failed on the server. Please verify backend is running.');
        }
      },
      onError: (errMsg) => {
        setIsGoogleLoading(false);
        setError(errMsg);
      },
    });
  };

  const fillQuickUser = (role) => {
    if (role === 'PROFESSOR') {
      setEmail(`priya.sharma@${defaultDomain}`);
      setPassword('password123');
    } else {
      setEmail(`rahul.sharma@${defaultDomain}`);
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Dark Navy Testimonial Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-navy-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top brand */}
        <Link to="/" className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
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
        </Link>

        {/* Testimonial Quote */}
        <div className="my-auto z-10 max-w-md space-y-6">
          <div className="text-brand-400 font-serif text-5xl leading-none">“</div>
          <blockquote className="text-2xl sm:text-3xl font-light text-slate-100 leading-snug">
            Open LMS helps me see the whole semester without feeling overwhelmed.
          </blockquote>
          <div>
            <div className="font-semibold text-white text-base">Rahul Sharma</div>
            <div className="text-xs text-slate-400">Computer Science, Class of 2027</div>
          </div>

          {/* Campus photo card vignette */}
          <div className="pt-6">
            <div className="rounded-2xl overflow-hidden border border-navy-700/80 bg-navy-800/80 shadow-2xl relative p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-brand-400 flex items-center justify-center text-white font-bold text-lg">
                GEU
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Graphic Era University</p>
                <p className="text-[11px] text-slate-400">Official Open LMS Academic Portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="text-xs text-slate-500 z-10 flex items-center gap-4">
          <span>Protected by Institutional SSO</span>
          <span>•</span>
          <span>256-bit SSL</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl w-full mx-auto">
        <div className="lg:hidden flex items-center justify-between pb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
              OL
            </div>
            <span className="font-bold text-base text-ink">Open LMS</span>
          </Link>
        </div>

        <div className="my-auto py-8">
          {/* Eyebrow & Titles */}
          <div className="mb-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-1 block">
              Welcome back
            </span>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">
              Sign in to Open LMS
            </h1>
            <p className="text-sm text-ink-muted">
              Pick up right where you left off.
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-ink-muted font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Quick demo login:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillQuickUser('STUDENT')}
                className="px-2.5 py-1 rounded-md bg-white border border-ink-border text-brand-700 font-medium hover:bg-brand-50"
              >
                Rahul (Student)
              </button>
              <button
                type="button"
                onClick={() => fillQuickUser('PROFESSOR')}
                className="px-2.5 py-1 rounded-md bg-white border border-ink-border text-slate-700 font-medium hover:bg-slate-100"
              >
                Dr. Sharma (Professor)
              </button>
            </div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            disabled={isGoogleLoading || isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl border border-ink-border hover:bg-slate-50 text-ink text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

        
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-ink-muted font-bold tracking-wider">
                OR
              </span>
            </div>
          </div>

       
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <Input
              label="University email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`rahul.sharma@${defaultDomain}`}
              required
            />

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              forgotPasswordLink
              required
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="rounded border-ink-border text-brand-500 focus:ring-brand-400 w-4 h-4"
                />
                <span className="text-xs text-ink-muted">
                  Keep me signed in on this device
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isGoogleLoading}
              className="w-full mt-2 font-bold"
            >
              Sign in
            </Button>
          </form>

          {/* Create Account link */}
          <div className="text-center mt-6 text-xs text-ink-muted">
            New to Open LMS?{' '}
            <Link to="/choose-role" className="font-bold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[11px] text-ink-muted">
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-ink">Privacy</a>
            <a href="#terms" className="hover:text-ink">Terms</a>
            <a href="#accessibility" className="hover:text-ink">Accessibility</a>
          </div>
          <span>© 2026 Open LMS</span>
        </div>
      </div>
    </div>
  );
}
