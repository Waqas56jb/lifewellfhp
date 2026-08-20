/**
 * Lightweight site-wide notice from CMS announcements.
 */
export function SiteNotice({
  announcements,
}: {
  announcements: { title: string; body: string; tone: string }[];
}) {
  const notice = announcements[0];
  if (!notice) return null;
  const bg =
    notice.tone === 'urgent'
      ? 'bg-[#fdeceb] text-[#b3261e]'
      : notice.tone === 'warning'
        ? 'bg-[#fff4d6] text-[#9a6700]'
        : 'bg-[#e8f0f7] text-[#2f6691]';

  return (
    <div className={`px-5 py-3 text-center text-sm sm:px-[30px] lg:px-10 ${bg}`} role="status">
      <strong className="font-semibold">{notice.title}: </strong>
      <span>{notice.body}</span>
    </div>
  );
}
