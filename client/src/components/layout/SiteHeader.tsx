import { Header } from '@/components/layout/Header';
import { getResolvedContent } from '@/lib/cms-resolve';

export async function SiteHeader() {
  const cms = await getResolvedContent();
  return (
    <Header
      cta={{ label: cms.settings.headerCtaLabel, href: cms.settings.headerCtaUrl }}
      logoUrl={cms.settings.logoUrl}
      notices={cms.announcements}
    />
  );
}
