'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchEntries, type SearchEntry } from '@/data/search-index';
import { cn } from '@/lib/utils';

/**
 * Site search.
 *
 * The WordPress site had a `?s=` search box; this replaces it without a server
 * round trip — the index is derived from the same typed content the pages
 * render and ships in the static bundle.
 *
 * Implemented as a combobox: arrow keys move through results, Enter opens the
 * highlighted one, Escape closes and restores focus. Results are announced
 * politely so screen-reader users hear the count change.
 */
export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Cmd/Ctrl-K is the conventional shortcut and costs nothing to support.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-2 rounded-sm border border-border-subtle px-3 text-sm text-text-secondary transition-colors duration-quick hover:border-brand-primary hover:text-brand-primary-solid"
      >
        <SearchIcon />
        <span className="sr-only">Search this site</span>
        <span aria-hidden="true" className="hidden text-xs xl:inline">
          Search
        </span>
      </button>

      {open && (
        <SearchDialog
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const inputId = useId();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchEntries(query), [query]);

  useEffect(() => {
    inputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => setActive(0), [query]);

  const go = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    onClose();
    router.push(entry.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Tab') {
      // Only the input and close button are focusable; keep focus inside.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>('input, button');
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const dialog = (
    <div className="fixed inset-0 z-[90] h-[100dvh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-text-primary/50" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search this site"
        className="absolute left-1/2 top-[max(1rem,env(safe-area-inset-top))] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-md border border-border-subtle bg-surface-raised shadow-lg sm:top-[10vh] sm:w-[min(40rem,calc(100vw-2rem))]"
      >
        <div className="flex items-center gap-2 border-b border-border-subtle px-3 sm:gap-3 sm:px-5">
          <SearchIcon />
          <label htmlFor={inputId} className="sr-only">
            Search services, questions and pages
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, questions and pages…"
            className="min-h-14 min-w-0 flex-1 border-0 bg-transparent text-md text-text-primary outline-none placeholder:text-text-secondary/60"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-text-secondary transition-colors duration-quick hover:bg-surface-muted"
          >
            <span className="sr-only">Close search</span>
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
          {query.trim().length < 2 ? (
            <p className="px-5 py-8 text-center text-sm text-text-secondary">
              Type at least two characters to search.
            </p>
          ) : results.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-text-secondary">
                No results for “{query.trim()}”.
              </p>
              <p className="mt-3 text-sm">
                <Link
                  href="/contact-telehealth-mental-health-provider"
                  onClick={onClose}
                  className="font-semibold text-text-link"
                >
                  Contact us
                </Link>{' '}
                and we’ll help directly.
              </p>
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label="Search results" className="py-2">
              {results.map((entry, i) => (
                <li key={`${entry.href}-${entry.title}`} role="none">
                  <Link
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    href={entry.href}
                    onClick={onClose}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'block px-5 py-3 no-underline transition-colors duration-quick',
                      i === active ? 'bg-brand-primary-soft' : 'hover:bg-surface-muted'
                    )}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 font-semibold text-text-primary">{entry.title}</span>
                      <span className="shrink-0 text-xs uppercase tracking-wide text-text-secondary">
                        {entry.section}
                      </span>
                    </span>
                    {entry.summary && (
                      <span className="mt-1 block text-sm leading-snug text-text-secondary">
                        {entry.summary}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p aria-live="polite" className="sr-only">
          {query.trim().length >= 2
            ? `${results.length} result${results.length === 1 ? '' : 's'} for ${query.trim()}`
            : ''}
        </p>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="17"
      height="17"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="shrink-0"
    >
      <circle cx="7.8" cy="7.8" r="5.3" />
      <path d="m11.8 11.8 3.7 3.7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="17"
      height="17"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 4l10 10M14 4L4 14" />
    </svg>
  );
}
