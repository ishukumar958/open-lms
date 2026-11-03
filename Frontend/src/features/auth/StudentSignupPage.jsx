import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { promptGoogleLogin } from '../../lib/googleAuth';
import { joinCourse } from '../../lib/api/coursesApi';
import { ShieldCheck, Check, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function StudentSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, googleLogin, login, isAuthenticated, user: currentUser } = useAuthStore();
  const isProfessor = location.pathname.includes('professor') || location.pathname.includes('teacher');
  const roleName = isProfessor ? 'FACULTY' : 'STUDENT';

  const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN;
  const defaultDomain = allowedDomain || 'geu.edu';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    program: '',
    year: '',
    studentId: '',
    classCode: '',
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [formError, setFormError] = useState('');

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setFormError('');
    if (allowedDomain && !formData.email.toLowerCase().endsWith('@' + allowedDomain.toLowerCase())) {
      setFormError(`Please use a valid @${allowedDomain} email address.`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleCompleteSignup = async (e, skipClassCode = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');

    // If already authenticated, redirect straight to dashboard
    if (isAuthenticated && currentUser) {
      if (isProfessor || currentUser?.role === 'FACULTY' || currentUser?.role === 'PROFESSOR') {
        navigate('/professor/overview');
      } else {
        navigate('/student/home');
      }
      return;
    }

    if (!formData.email || !formData.password) {
      setCurrentStep(1);
      setFormError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      let user;
      try {
        user = await register({
          name: `${formData.firstName} ${formData.lastName}`.trim() || formData.email.split('@')[0],
          email: formData.email.trim(),
          password: formData.password,
          roleName,
        });
      } catch (regErr) {
        const msg = (regErr?.message || '').toLowerCase();
        if (msg.includes('already registered') || regErr?.status === 409) {
          // Attempt automatic login with the provided credentials
          try {
            user = await login(formData.email.trim(), formData.password, roleName);
          } catch {
            throw new Error('An account with this email already exists. Please sign in to continue.');
          }
        } else {
          throw regErr;
        }
      }

      if (!isProfessor && !skipClassCode && formData.classCode && formData.classCode.trim()) {
        try {
          await joinCourse({ courseCode: formData.classCode.trim() });
        } catch (joinErr) {
          console.warn('Non-blocking class code join warning:', joinErr);
        }
      }

      if (isProfessor || user?.role === 'FACULTY' || user?.role === 'PROFESSOR') {
        navigate('/professor/overview');
      } else {
        navigate('/student/home');
      }
    } catch (err) {
      setFormError(err.message || 'Unable to complete sign-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    setFormError('');
    promptGoogleLogin({
      roleName,
      onStart: () => setIsGoogleLoading(true),
      onSuccess: async ({ accessToken }) => {
        try {
          const user = await googleLogin({ accessToken, roleName });
          setIsGoogleLoading(false);
          if (roleName === 'FACULTY' || user?.role === 'FACULTY' || user?.role === 'PROFESSOR') {
            navigate('/professor/overview');
          } else {
            navigate('/student/home');
          }
        } catch (err) {
          setIsGoogleLoading(false);
          setFormError(err.message || 'Google sign-up failed on server. Please verify backend is running.');
        }
      },
      onError: (errMsg) => {
        setIsGoogleLoading(false);
        setFormError(errMsg);
      },
    });
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 max-w-7xl w-full mx-auto">
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
        <div className="text-right text-xs text-ink-muted">
          <span className="hidden sm:inline">Already registered? </span>
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-6 py-6 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-start">
          {/* Left Column: Intro & 3-Step Stepper */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-2 block">
                {isProfessor ? 'Professor account' : 'Student account'}
              </span>
              <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-3">
                {isProfessor ? 'Create your teaching space.' : 'Create your learning space.'}
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                {isProfessor
                  ? 'Manage your academic courses, assignments, quizzes, and student rosters.'
                  : 'Join your classes and keep every deadline, discussion, and result in view.'}
              </p>
            </div>

            {/* Stepper */}
            <div className="space-y-4 py-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                    currentStep > 1
                      ? 'bg-success text-white'
                      : currentStep === 1
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">Account details</div>
                  <div className="text-xs text-brand-600 font-medium">
                    {currentStep === 1 ? 'Current step' : 'Completed'}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                    currentStep > 2
                      ? 'bg-success text-white'
                      : currentStep === 2
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">Academic profile</div>
                  <div className="text-xs text-ink-muted">Program and year</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                    currentStep === 3
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  3
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">
                    {isProfessor ? 'Teaching workspace' : 'Join your first class'}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {isProfessor ? 'Access faculty portal' : 'Use a 6 digit class code'}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-xs text-ink-muted leading-relaxed">
                Your academic information is protected and only shared with your institution.
              </p>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-4 sm:p-8 border border-ink-border shadow-soft">
              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex flex-col gap-2">
                  <div className="flex items-start gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                  {formError.toLowerCase().includes('already') && (
                    <div className="flex items-center gap-2 pt-2 border-t border-rose-200/60">
                      <span className="text-xs text-rose-600">Already registered?</span>
                      <Link to="/login" className="text-xs font-bold text-rose-800 underline hover:text-rose-900">
                        Sign in to your account →
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {currentStep === 1 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-ink">Account details</h2>
                    <p className="text-xs text-ink-muted mt-1">
                      Use your university email to connect with Northbridge.
                    </p>
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="First name"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        placeholder="Rahul"
                        required
                      />
                      <Input
                        label="Last name"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Sharma"
                        required
                      />
                    </div>

                    <Input
                      label="University email"
                      type="email"
                      value={formData.email}
                      error={formError}
                      onChange={(e) => {
                        setFormError('');
                        setFormData({ ...formData, email: e.target.value });
                      }}
                      placeholder={`rahul.sharma@${defaultDomain}`}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PasswordInput
                        label="Create password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••••"
                        required
                      />
                      <PasswordInput
                        label="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        placeholder="••••••••••"
                        required
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1.5 h-1.5 w-full">
                        <div className="flex-1 rounded-full bg-emerald-500" />
                        <div className="flex-1 rounded-full bg-emerald-500" />
                        <div className="flex-1 rounded-full bg-emerald-500" />
                        <div className="flex-1 rounded-full bg-emerald-400" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-600">
                        {passwordStrength}
                      </p>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreedToTerms}
                          onChange={(e) =>
                            setFormData({ ...formData, agreedToTerms: e.target.checked })
                          }
                          className="mt-0.5 rounded border-ink-border text-brand-500 focus:ring-brand-400 w-4 h-4"
                          required
                        />
                        <span className="text-xs text-ink-muted leading-snug">
                          I agree to the{' '}
                          <a href="#terms" className="text-brand-600 underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#privacy" className="text-brand-600 underline">
                            Student Privacy Policy
                          </a>
                          .
                        </span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-4 font-bold"
                    >
                      Continue to profile
                    </Button>
                  </form>

                  {/* Divider */}
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

                  {/* Google */}
                  <button
                    type="button"
                    disabled={isGoogleLoading || isSubmitting}
                    onClick={handleGoogleSignUp}
                    className="w-full py-2.5 px-4 rounded-xl border border-ink-border hover:bg-slate-50 text-ink text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
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
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-ink">Academic profile</h2>
                    <p className="text-xs text-ink-muted mt-1">
                      Help your professors and department recognize you.
                    </p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                        Program / Major
                      </label>
                      <select
                        value={formData.program}
                        onChange={(e) =>
                          setFormData({ ...formData, program: e.target.value })
                        }
                        className="w-full bg-white border border-ink-border rounded-lg text-sm text-ink py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
                      >
                        <option value="Cognitive Science">Cognitive Science</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Biology">Biology</option>
                        <option value="Interaction Design">Interaction Design</option>
                        <option value="Neuroscience">Neuroscience</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                        Academic Year
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        className="w-full bg-white border border-ink-border rounded-lg text-sm text-ink py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
                      >
                        <option value="Year 1 (Class of 2028)">Year 1 (Class of 2028)</option>
                        <option value="Year 2 (Class of 2027)">Year 2 (Class of 2027)</option>
                        <option value="Year 3 (Class of 2026)">Year 3 (Class of 2026)</option>
                        <option value="Year 4 (Class of 2025)">Year 4 (Class of 2025)</option>
                      </select>
                    </div>

                    <Input
                      label="Student ID (Optional)"
                      value={formData.studentId}
                      onChange={(e) =>
                        setFormData({ ...formData, studentId: e.target.value })
                      }
                      placeholder="e.g. NB-2027-8492"
                    />

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="flex-1 font-bold"
                      >
                        {isProfessor ? 'Continue to workspace' : 'Continue to class join'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-ink">
                      {isProfessor ? 'Welcome to your teaching workspace' : 'Join your first class'}
                    </h2>
                    <p className="text-xs text-ink-muted mt-1">
                      {isProfessor
                        ? 'Your faculty space is ready. Set up course modules, assignments, and grade rosters.'
                        : 'Enter the 6-digit class code provided by your instructor or department.'}
                    </p>
                  </div>

                  <form onSubmit={(e) => handleCompleteSignup(e, false)} className="space-y-6">
                    {!isProfessor && (
                      <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                          6-Digit Class Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.classCode}
                          onChange={(e) =>
                            setFormData({ ...formData, classCode: e.target.value.toUpperCase() })
                          }
                          placeholder="BIO214"
                          className="w-full text-center tracking-widest text-2xl font-mono font-bold uppercase py-4 border border-ink-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                        />
                        <p className="text-xs text-ink-muted mt-2 text-center">
                          Example: <span className="font-semibold text-brand-600">BIO214</span> (Cell Biology)
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full font-bold shadow-sm"
                    >
                      {isSubmitting
                        ? 'Entering Open LMS...'
                        : isProfessor
                        ? 'Enter Faculty Dashboard →'
                        : 'Join class & enter Open LMS'}
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={(e) => handleCompleteSignup(e, true)}
                        className="text-xs font-semibold text-ink-muted hover:text-ink underline disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? 'Redirecting to dashboard...' : 'Skip for now, go to dashboard →'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-ink-muted">
        © 2026 Open LMS. Northbridge Academic Ecosystem.
      </footer>
    </div>
  );
}
