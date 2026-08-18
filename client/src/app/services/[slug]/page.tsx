import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ServicePageContent } from '@/components/sections/ServicePageContent';
import { JsonLd } from '@/components/seo/JsonLd';

import { getService, getServiceSummary, serviceSlugs } from '@/data/services';
import { pageMetadata } from '@/lib/seo';
import { serviceGraph } from '@/lib/schema';

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

/** Unknown slugs 404 rather than rendering an empty shell. */
export const dynamicParams = false;

function description(slug: string): string {
  const summary = getServiceSummary(slug);
  const text = summary?.description ?? '';
  return text.length > 158 ? `${text.slice(0, 155).trimEnd()}…` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  const summary = getServiceSummary(slug);

  return pageMetadata({
    title: `${service.title} | Telehealth`,
    description: description(slug),
    path: `/services/${slug}`,
    image: summary
      ? {
          url: summary.image.src,
          width: summary.image.width,
          height: summary.image.height,
          alt: summary.image.alt,
        }
      : undefined,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd data={serviceGraph(service, description(slug))} id={`service-${slug}-schema`} />
      <ServicePageContent slug={slug} />
    </>
  );
}
