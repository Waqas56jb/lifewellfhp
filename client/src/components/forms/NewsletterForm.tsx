'use client';

import { useId, useState } from 'react';
import { submitNewsletter } from '@/lib/api';
import type { FormStatus } from '@/types/content';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm() {
  const id = useId();
  const emailId = `${id}-email`;

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const busy = status === 'submitting';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const value = email.trim();
    if (!value) {
      setError('Please enter your email address.');
      setStatus('error');
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    const res = await submitNewsletter({ email: value, company });

    if (res.success) {
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } else {
      setStatus('error');
      setError(res.message);
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-md border border-success/30 bg-brand-accent-soft px-6 py-5"
      >
        <CheckIcon />
        <p className="text-sm text-text-primary">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            disabled={busy}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${emailId}-error` : undefined}
            className={cn(
              'min-h-12 w-full rounded-xs border bg-surface-raised px-4 py-3 text-md text-text-primary',
              'placeholder:text-text-secondary/60 transition-colors duration-quick',
              'disabled:cursor-not-allowed disabled:opacity-70',
              error ? 'border-error' : 'border-border-input hover:border-brand-primary'
            )}
          />
        </div>

        {/* Honeypot */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={`${id}-company`}>Company</label>
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={busy} className="shrink-0">
          {busy ? 'Signing up…' : 'Sign Up'}
        </Button>
      </div>

      <p aria-live="polite" className="min-h-6">
        {error && (
          <span id={`${emailId}-error`} className="mt-2 block text-sm text-error">
            {error}
          </span>
        )}
      </p>
    </form>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-success"
    >
      <path d="m2.5 8.5 3.5 3.5 7.5-8" />
    </svg>
  );
}
