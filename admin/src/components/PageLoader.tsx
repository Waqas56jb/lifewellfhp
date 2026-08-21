export function PageLoader({ label = 'loading...' }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <span className="page-loader-orb" aria-hidden>
        <span className="page-loader-track" />
        <span className="page-loader-arc" />
        <span className="page-loader-core" />
      </span>
      <p>{label}</p>
    </div>
  );
}
