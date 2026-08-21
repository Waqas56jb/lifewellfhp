import { CTASection } from '@/components/sections/CTASection';
import { getResolvedContent } from '@/lib/cms-resolve';

export async function CmsCta() {
  const cms = await getResolvedContent();
  return <CTASection primaryHref={cms.booking.page} primaryLabel={cms.booking.label} />;
}
