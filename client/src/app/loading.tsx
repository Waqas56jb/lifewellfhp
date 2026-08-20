export default function Loading() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="nav-progress-bar h-full w-full origin-left bg-[#3E7FB1]" />
    </div>
  );
}
