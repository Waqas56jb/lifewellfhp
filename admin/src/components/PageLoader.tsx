export function PageLoader({ label = 'loading...' }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <span className="page-loader-ring" aria-hidden>
        <span />
      </span>
      <p>{label}</p>
    </div>
  );
}
