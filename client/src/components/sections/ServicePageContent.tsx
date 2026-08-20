import Link from 'next/link';

import { InnerPageHero } from '@/components/sections/InnerPageHero';
import { ContentSections } from '@/components/sections/ContentSections';
import { BenefitsGrid } from '@/components/sections/BenefitsGrid';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { SwapButton } from '@/components/ui/SwapButton';
import {
  getServiceSummary,
  relatedServices,
  summariesByCategory,
  serviceCategories,
} from '@/data/service-catalog';
import { getService } from '@/data/services';
import { site } from '@/data/site';

/**
 * Individual /services/[slug] template — live Elementor service layout:
 * rounded hero card (featured image + title + excerpt), two-column body
 * with related-service lists, benefits band, then related cards.
 */
export function ServicePageContent({ slug }: { slug: string }) {
  const service = getService(slug);
  const summary = getServiceSummary(slug);
  if (!service || !summary) return null;

  const related = relatedServices(slug, 3);
  const psych = summariesByCategory('psychiatric').filter((s) => s.slug !== slug);
  const primary = summariesByCategory('primary-care').filter((s) => s.slug !== slug);

  return (
    <div className="bg-white">
      <InnerPageHero
        image={{ src: summary.image.src, alt: summary.image.alt }}
        imageSide="left"
        title={summary.title}
        lead={summary.description}
        leadSize="subhead"
      />

      <section className="px-5 pb-16 sm:px-[30px] sm:pb-24 lg:px-10 lg:pb-[150px] min-[1601px]:px-[80px]">
        <div className="mx-auto grid max-w-[1840px] items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 min-[1601px]:grid-cols-[minmax(0,1fr)_24rem] min-[1601px]:gap-20">
          <article className="min-w-0">
            <h2 className="font-heading text-[28px] font-normal leading-[1.2] tracking-[-1px] text-[#5FAF6B] sm:text-[36px] min-[1181px]:text-[42px]">
              {service.lead}
            </h2>

            {service.intro.length > 0 && (
              <div className="mt-6 space-y-5">
                {service.intro.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-[16px] leading-[1.45] text-[#374151] min-[1181px]:text-[18px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <ContentSections sections={service.sections} variant="live" className="mt-12" />

            {service.cta && (
              <div className="mt-14 rounded-[20px] bg-[#EEF3F7] px-6 py-8 sm:px-8 sm:py-10">
                <h2 className="font-heading text-[22px] font-normal leading-[1.25] tracking-[-1px] text-[#5FAF6B] sm:text-[28px] min-[1181px]:text-[32px]">
                  {service.cta.heading}
                </h2>
                {service.cta.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="mt-4 text-[16px] leading-[1.45] text-[#374151] min-[1181px]:text-[18px]"
                  >
                    {paragraph}
                  </p>
                ))}
                <div className="mt-7">
                  <SwapButton href={site.booking.url}>
                    {summary.title.length > 42
                      ? 'Start Your Care Today'
                      : `Schedule Your ${summary.title} Today`}
                  </SwapButton>
                </div>
              </div>
            )}
          </article>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <ServiceList
              heading={serviceCategories.psychiatric.label}
              links={psych}
            />
            <ServiceList
              heading={serviceCategories['primary-care'].label}
              links={primary}
              className="mt-10"
            />

            <div className="mt-10 rounded-[20px] bg-[#EEF3F7] px-6 py-8">
              <h2 className="font-heading text-[22px] font-medium italic leading-[1.3] tracking-[-1px] text-[#5FAF6B] sm:text-[24px]">
                Schedule Your Consultation Today
              </h2>
              <p className="mt-4 text-[16px] leading-[1.45] text-[#374151]">
                Take the first step toward better mental health with secure and personalized
                telehealth support tailored to your needs.
              </p>
              <div className="mt-6">
                <SwapButton href={site.booking.url} size="sm">
                  Start Your Care Today
                </SwapButton>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <BenefitsGrid heading="Why Patients Choose Our Telehealth Clinic" tone="base" />

      {related.length > 0 && (
        <section className="px-5 py-16 sm:px-[30px] sm:py-24 lg:px-10 lg:py-[150px] min-[1601px]:px-[80px]">
          <div className="mx-auto max-w-[1840px]">
            <h2 className="text-center font-heading text-[30px] font-normal leading-[1.15] tracking-[-2px] sm:text-[48px] min-[1181px]:text-[56px]">
              <span className="text-[#5FAF6B]">Related </span>
              <span className="italic text-[#3E7FB1]">Services</span>
            </h2>
            <div className="mt-12">
              <ServicesGrid services={related} columns={3} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ServiceList({
  heading,
  links,
  className,
}: {
  heading: string;
  links: { href: string; title: string }[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <nav aria-label={heading} className={className}>
      <h2 className="font-heading text-[20px] font-medium italic leading-[1.3] tracking-[-1px] text-[#5FAF6B] sm:text-[22px]">
        {heading}
      </h2>
      <ul className="mt-4 flex list-none flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-[7px] px-2.5 py-2.5 text-[16px] leading-[1.4] text-[#5FAF6B] no-underline transition-colors duration-300 hover:bg-[#3E7FB1] hover:text-white"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
