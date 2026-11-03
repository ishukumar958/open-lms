import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, Search } from 'lucide-react';

export const Input = React.forwardRef(
  ({ className, type = 'text', label, error, helperText, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full bg-white border border-ink-border rounded-lg text-sm text-ink placeholder:text-ink-subtle',
              'py-2.5 px-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
              Icon && 'pl-10',
              error && 'border-danger focus:ring-danger text-danger',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const PasswordInput = React.forwardRef(
  ({ className, label, error, forgotPasswordLink, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {label}
            </label>
            {props.forgotPasswordLink && (
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link sent to registered email.');
                }}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline"
              >
                Forgot password?
              </a>
            )}
          </div>
        )}
        <div className="relative rounded-lg shadow-sm">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'w-full bg-white border border-ink-border rounded-lg text-sm text-ink placeholder:text-ink-subtle',
              'py-2.5 pl-3.5 pr-10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
              error && 'border-danger focus:ring-danger',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export const SearchInput = React.forwardRef(
  ({ className, placeholder = 'Search Open LMS...', onShortcut, ...props }, ref) => {
    return (
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className={cn(
            'w-full bg-slate-100/90 hover:bg-slate-100 border border-transparent rounded-lg text-xs text-ink placeholder:text-ink-muted/80',
            'py-2 pl-9 pr-12 transition-all focus:bg-white focus:border-ink-border focus:outline-none focus:ring-2 focus:ring-brand-400',
            className
          )}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block text-[10px] font-medium text-ink-muted bg-white px-1.5 py-0.5 rounded border border-ink-border shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
