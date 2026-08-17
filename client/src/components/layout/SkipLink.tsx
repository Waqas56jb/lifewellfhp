/**
 * Bypass block (WCAG 2.4.1). Visually hidden until focused, then pinned to the
 * top-left so keyboard users get a visible, high-contrast target.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:inline-flex focus:items-center
        focus:rounded-sm focus:bg-brand-primary-solid
        focus:px-6 focus:py-4 focus:text-sm focus:font-semibold
        focus:text-text-inverse focus:no-underline focus:shadow-lg
      "
    >
      Skip to main content
    </a>
  );
}
